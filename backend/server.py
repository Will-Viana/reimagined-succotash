from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    total_points: int = 0
    teacher_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PublicStudent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    total_points: int = 0
    created_at: datetime

class StudentCreate(BaseModel):
    name: str

class ScoreBreakdown(BaseModel):
    postura: int = 0
    afinacao: int = 0
    execucao_sala: int = 0
    musica_pronta: int = 0
    estudos_diarios: int = 0
    estudos_parciais: int = 0
    pilulas: int = 0
    obediencia: int = 0

class WeeklyScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    week_start_date: str
    week_end_date: str
    scores: ScoreBreakdown
    challenge_completed: bool = False
    challenge_points: int = 0
    total_week_points: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WeeklyScoreCreate(BaseModel):
    student_id: str
    scores: ScoreBreakdown
    challenge_completed: bool = False

class ScoreAdjustment(BaseModel):
    student_id: str
    points: int
    reason: str = ""

class MonthlyChallenge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    points: int
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChallengeCreate(BaseModel):
    title: str
    description: str
    points: int

class ChallengeComplete(BaseModel):
    student_id: str
    week_start_date: str

class CompetitionState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    active: bool = True
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_end_date: Optional[datetime] = None

# ==================== AUTH HELPERS ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=user_data.email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict['password_hash'] = get_password_hash(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user['id']})
    user_obj = User(**user)
    return {"access_token": access_token, "token_type": "bearer", "user": user_obj}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== STUDENTS ROUTES ====================

@api_router.post("/students", response_model=Student)
async def create_student(student_data: StudentCreate, current_user: User = Depends(get_current_user)):
    student = Student(name=student_data.name, teacher_id=current_user.id)
    student_dict = student.model_dump()
    student_dict['created_at'] = student_dict['created_at'].isoformat()
    
    await db.students.insert_one(student_dict)
    return student

@api_router.get("/students", response_model=List[Student])
async def get_students(current_user: User = Depends(get_current_user)):
    students = await db.students.find({"teacher_id": current_user.id}, {"_id": 0}).to_list(1000)
    for student in students:
        if isinstance(student['created_at'], str):
            student['created_at'] = datetime.fromisoformat(student['created_at'])
    return students

@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str, current_user: User = Depends(get_current_user)):
    result = await db.students.delete_one({"id": student_id, "teacher_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Also delete their scores
    await db.weekly_scores.delete_many({"student_id": student_id})
    return {"message": "Student deleted successfully"}

@api_router.get("/students/{student_id}/history", response_model=List[WeeklyScore])
async def get_student_history(student_id: str, current_user: User = Depends(get_current_user)):
    scores = await db.weekly_scores.find({"student_id": student_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for score in scores:
        if isinstance(score['created_at'], str):
            score['created_at'] = datetime.fromisoformat(score['created_at'])
    return scores

# ==================== SCORES ROUTES ====================

def get_week_dates():
    today = datetime.now(timezone.utc)
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

@api_router.post("/scores", response_model=WeeklyScore)
async def add_score(score_data: WeeklyScoreCreate, current_user: User = Depends(get_current_user)):
    week_start, week_end = get_week_dates()
    
    # Calculate total points
    scores_dict = score_data.scores.model_dump()
    total_points = sum(scores_dict.values())
    
    if score_data.challenge_completed:
        challenge = await db.monthly_challenge.find_one({"active": True}, {"_id": 0})
        if challenge:
            total_points += challenge['points']
    
    # Check if score exists for this week
    existing_score = await db.weekly_scores.find_one({
        "student_id": score_data.student_id,
        "week_start_date": week_start,
        "week_end_date": week_end
    })
    
    if existing_score:
        # Update existing score
        update_data = {
            "scores": scores_dict,
            "challenge_completed": score_data.challenge_completed,
            "challenge_points": challenge['points'] if score_data.challenge_completed and challenge else 0,
            "total_week_points": total_points
        }
        await db.weekly_scores.update_one(
            {"id": existing_score['id']},
            {"$set": update_data}
        )
        
        # Update student total
        student = await db.students.find_one({"id": score_data.student_id})
        if student:
            # Recalculate total from all weeks
            all_scores = await db.weekly_scores.find({"student_id": score_data.student_id}, {"_id": 0}).to_list(1000)
            new_total = sum(s['total_week_points'] for s in all_scores)
            await db.students.update_one({"id": score_data.student_id}, {"$set": {"total_points": new_total}})
        
        existing_score.update(update_data)
        return WeeklyScore(**existing_score)
    
    # Create new score
    challenge_points = 0
    if score_data.challenge_completed:
        challenge = await db.monthly_challenge.find_one({"active": True}, {"_id": 0})
        if challenge:
            challenge_points = challenge['points']
    
    weekly_score = WeeklyScore(
        student_id=score_data.student_id,
        week_start_date=week_start,
        week_end_date=week_end,
        scores=score_data.scores,
        challenge_completed=score_data.challenge_completed,
        challenge_points=challenge_points,
        total_week_points=total_points
    )
    
    score_dict = weekly_score.model_dump()
    score_dict['created_at'] = score_dict['created_at'].isoformat()
    score_dict['scores'] = scores_dict
    
    await db.weekly_scores.insert_one(score_dict)
    
    # Update student total points
    student = await db.students.find_one({"id": score_data.student_id})
    if student:
        new_total = student.get('total_points', 0) + total_points
        await db.students.update_one({"id": score_data.student_id}, {"$set": {"total_points": new_total}})
    
    return weekly_score

@api_router.post("/scores/adjust")
async def adjust_score(adjustment: ScoreAdjustment, current_user: User = Depends(get_current_user)):
    student = await db.students.find_one({"id": adjustment.student_id, "teacher_id": current_user.id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    new_total = max(0, student.get('total_points', 0) + adjustment.points)
    await db.students.update_one({"id": adjustment.student_id}, {"$set": {"total_points": new_total}})
    
    return {"message": "Points adjusted", "new_total": new_total}

# ==================== CHALLENGE ROUTES ====================

@api_router.get("/challenge", response_model=Optional[MonthlyChallenge])
async def get_challenge():
    challenge = await db.monthly_challenge.find_one({"active": True}, {"_id": 0})
    if challenge:
        if isinstance(challenge['created_at'], str):
            challenge['created_at'] = datetime.fromisoformat(challenge['created_at'])
        if isinstance(challenge['updated_at'], str):
            challenge['updated_at'] = datetime.fromisoformat(challenge['updated_at'])
        return MonthlyChallenge(**challenge)
    return None

@api_router.post("/challenge", response_model=MonthlyChallenge)
async def create_or_update_challenge(challenge_data: ChallengeCreate, current_user: User = Depends(get_current_user)):
    # Deactivate previous challenges
    await db.monthly_challenge.update_many({"active": True}, {"$set": {"active": False}})
    
    challenge = MonthlyChallenge(
        title=challenge_data.title,
        description=challenge_data.description,
        points=challenge_data.points
    )
    
    challenge_dict = challenge.model_dump()
    challenge_dict['created_at'] = challenge_dict['created_at'].isoformat()
    challenge_dict['updated_at'] = challenge_dict['updated_at'].isoformat()
    
    await db.monthly_challenge.insert_one(challenge_dict)
    return challenge

# ==================== RANKING ROUTES ====================

@api_router.get("/ranking/public", response_model=List[Student])
async def get_public_ranking():
    students = await db.students.find({}, {"_id": 0, "teacher_id": 0}).sort("total_points", -1).to_list(1000)
    for student in students:
        if isinstance(student.get('created_at'), str):
            student['created_at'] = datetime.fromisoformat(student['created_at'])
    return students

# ==================== COMPETITION ROUTES ====================

@api_router.post("/competition/end")
async def end_competition(current_user: User = Depends(get_current_user)):
    # Archive current scores by marking them as completed
    await db.students.update_many(
        {"teacher_id": current_user.id},
        {"$set": {"total_points": 0}}
    )
    
    return {"message": "Competition ended and points reset"}

@api_router.get("/competition/status")
async def get_competition_status(current_user: User = Depends(get_current_user)):
    student_count = await db.students.count_documents({"teacher_id": current_user.id})
    return {
        "active": True,
        "student_count": student_count,
        "start_date": datetime.now(timezone.utc).isoformat()
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()