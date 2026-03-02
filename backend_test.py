#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

class ViolinQuestTester:
    def __init__(self):
        self.base_url = "https://note-quest-scores.preview.emergentagent.com/api"
        self.token = None
        self.teacher_id = None
        self.student_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            self.failed_tests.append(f"{name}: {details}")
            print(f"❌ {name} - FAILED {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        try:
            print(f"\n🔍 Testing {name}...")
            print(f"   URL: {url}")
            
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            print(f"   Response: {response.status_code}")
            
            success = response.status_code == expected_status
            details = f"(Status: {response.status_code})"
            
            if success and response.text:
                try:
                    resp_data = response.json()
                    if name == "Teacher Registration":
                        if 'access_token' in resp_data:
                            self.token = resp_data['access_token']
                            self.teacher_id = resp_data.get('user', {}).get('id')
                            details += f" - Token acquired"
                    elif name == "Teacher Login":
                        if 'access_token' in resp_data:
                            self.token = resp_data['access_token']
                            self.teacher_id = resp_data.get('user', {}).get('id')
                            details += f" - Login successful"
                    elif name == "Add Student":
                        if 'id' in resp_data:
                            self.student_id = resp_data['id']
                            details += f" - Student ID: {self.student_id}"
                    return success, resp_data
                except json.JSONDecodeError:
                    details += " - Invalid JSON response"
            
            self.log_test(name, success, details)
            return success, {} if not success else response.json() if response.text else {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_teacher_registration(self):
        """Test teacher registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        email = f"professor{timestamp}@teste.com"
        return self.run_test(
            "Teacher Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": email,
                "name": f"Professor Teste {timestamp}",
                "password": "senha123456"
            }
        )

    def test_teacher_login(self):
        """Test teacher login with existing credentials"""
        return self.run_test(
            "Teacher Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "professor@teste.com",
                "password": "senha123456"
            }
        )

    def test_auth_me(self):
        """Test get current user"""
        return self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )

    def test_add_student(self):
        """Test adding a new student"""
        timestamp = datetime.now().strftime("%H%M%S")
        return self.run_test(
            "Add Student",
            "POST",
            "students",
            200,
            data={
                "name": f"Aluno Teste {timestamp}"
            }
        )

    def test_get_students(self):
        """Test getting students list"""
        return self.run_test(
            "Get Students List",
            "GET",
            "students",
            200
        )

    def test_add_scores(self):
        """Test adding scores for a student"""
        if not self.student_id:
            self.log_test("Add Scores", False, "No student ID available")
            return False, {}
            
        return self.run_test(
            "Add Student Scores",
            "POST",
            "scores",
            200,
            data={
                "student_id": self.student_id,
                "scores": {
                    "postura": 2,
                    "afinacao": 3,
                    "execucao_sala": 4,
                    "musica_pronta": 3,
                    "estudos_diarios": 5,
                    "estudos_parciais": 2,
                    "pilulas": 4,
                    "obediencia": 6
                },
                "challenge_completed": False
            }
        )

    def test_create_challenge(self):
        """Test creating monthly challenge"""
        return self.run_test(
            "Create Monthly Challenge",
            "POST",
            "challenge",
            200,
            data={
                "title": "Tocar escala de Dó maior",
                "description": "Execute perfeitamente a escala de Dó maior em uma oitava",
                "points": 10
            }
        )

    def test_get_challenge(self):
        """Test getting current challenge"""
        return self.run_test(
            "Get Current Challenge",
            "GET",
            "challenge",
            200
        )

    def test_adjust_points(self):
        """Test adjusting student points"""
        if not self.student_id:
            self.log_test("Adjust Points", False, "No student ID available")
            return False, {}
            
        return self.run_test(
            "Adjust Student Points",
            "POST",
            "scores/adjust",
            200,
            data={
                "student_id": self.student_id,
                "points": 5,
                "reason": "Participação extra"
            }
        )

    def test_student_history(self):
        """Test getting student history"""
        if not self.student_id:
            self.log_test("Get Student History", False, "No student ID available")
            return False, {}
            
        return self.run_test(
            "Get Student History",
            "GET",
            f"students/{self.student_id}/history",
            200
        )

    def test_public_ranking(self):
        """Test public ranking (no auth required)"""
        # Temporarily remove auth token for public endpoint
        temp_token = self.token
        self.token = None
        result = self.run_test(
            "Get Public Ranking",
            "GET",
            "ranking/public",
            200
        )
        self.token = temp_token
        return result

    def test_competition_status(self):
        """Test getting competition status"""
        return self.run_test(
            "Get Competition Status",
            "GET",
            "competition/status",
            200
        )

    def test_delete_student(self):
        """Test deleting a student"""
        if not self.student_id:
            self.log_test("Delete Student", False, "No student ID available")
            return False, {}
            
        return self.run_test(
            "Delete Student",
            "DELETE",
            f"students/{self.student_id}",
            200
        )

    def test_end_competition(self):
        """Test ending competition"""
        return self.run_test(
            "End Competition",
            "POST",
            "competition/end",
            200
        )

    def run_all_tests(self):
        """Run all backend tests"""
        print("🎯 Starting Violin Quest Backend API Testing...")
        print(f"📍 Base URL: {self.base_url}")
        print("-" * 80)

        # Authentication Tests
        print("\n📋 AUTHENTICATION TESTS")
        self.test_teacher_registration()
        
        # Student Management Tests  
        print("\n📋 STUDENT MANAGEMENT TESTS")
        self.test_add_student()
        self.test_get_students()
        
        # Scoring Tests
        print("\n📋 SCORING TESTS")  
        self.test_add_scores()
        self.test_adjust_points()
        self.test_student_history()
        
        # Challenge Tests
        print("\n📋 CHALLENGE TESTS")
        self.test_create_challenge()
        self.test_get_challenge()
        
        # Public API Tests
        print("\n📋 PUBLIC API TESTS")
        self.test_public_ranking()
        
        # Admin Tests
        print("\n📋 ADMIN TESTS")
        self.test_competition_status()
        self.test_end_competition()
        
        # Cleanup
        print("\n📋 CLEANUP TESTS")
        self.test_delete_student()

        # Results Summary
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n💥 FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = ViolinQuestTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())