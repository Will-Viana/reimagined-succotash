import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, setAuthToken } from "../App";
import { toast } from "sonner";
import {
  Music,
  LogOut,
  Plus,
  Trash2,
  Trophy,
  Star,
  Target,
  RotateCcw,
  Edit,
  Save,
  X,
  History,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showAdjustPoints, setShowAdjustPoints] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [scoreForm, setScoreForm] = useState({
    student_id: "",
    scores: {},
    challenge_completed: false
  });

  const [challengeForm, setChallengeForm] = useState({
    title: "",
    description: "",
    points: 10
  });

  const [adjustForm, setAdjustForm] = useState({
    student_id: "",
    points: 0,
    reason: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, studentsRes, challengeRes, criteriaRes] = await Promise.all([
        axios.get(`${API}/auth/me`),
        axios.get(`${API}/students`),
        axios.get(`${API}/challenge`),
        axios.get(`${API}/criteria`)
      ]);
      setUser(userRes.data);
      setStudents(studentsRes.data.sort((a, b) => b.total_points - a.total_points));
      setChallenge(challengeRes.data);
      setCriteria(criteriaRes.data);
      
      // Initialize score form with criteria
      const initialScores = {};
      criteriaRes.data.forEach(c => {
        initialScores[c.id] = 0;
      });
      setScoreForm(prev => ({ ...prev, scores: initialScores }));
    } catch (error) {
      toast.error("Erro ao carregar dados");
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Verificar se o usuário quer manter os dados salvos
    const keepRemembered = localStorage.getItem('rememberMe') === 'true';
    
    setAuthToken(null);
    
    // Só limpar os dados se não tiver "lembrar-me" ativado
    if (!keepRemembered) {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
    
    navigate("/login");
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/students`, { name: newStudentName });
      toast.success("Aluno adicionado!");
      setNewStudentName("");
      setShowAddStudent(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao adicionar aluno");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Tem certeza que deseja remover este aluno?")) return;
    try {
      await axios.delete(`${API}/students/${studentId}`);
      toast.success("Aluno removido!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover aluno");
    }
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/scores`, {
        student_id: scoreForm.student_id,
        scores: scoreForm.scores,
        challenge_completed: scoreForm.challenge_completed
      });
      toast.success("Pontos adicionados!");
      setShowScoreForm(false);
      const initialScores = {};
      criteria.forEach(c => {
        initialScores[c.id] = 0;
      });
      setScoreForm({
        student_id: "",
        scores: initialScores,
        challenge_completed: false
      });
      fetchData();
    } catch (error) {
      toast.error("Erro ao adicionar pontos");
    }
  };

  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/challenge`, challengeForm);
      toast.success("Desafio criado/atualizado!");
      setShowChallengeForm(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao criar desafio");
    }
  };

  const handleDeleteChallenge = async () => {
    if (!window.confirm("Tem certeza que deseja excluir o desafio do mês?")) return;
    try {
      await axios.delete(`${API}/challenge`);
      toast.success("Desafio excluído!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao excluir desafio");
    }
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/scores/adjust`, adjustForm);
      toast.success("Pontos ajustados!");
      setShowAdjustPoints(false);
      setAdjustForm({ student_id: "", points: 0, reason: "" });
      fetchData();
    } catch (error) {
      toast.error("Erro ao ajustar pontos");
    }
  };

  const handleEndCompetition = async () => {
    if (!window.confirm("Tem certeza que deseja encerrar a competição e zerar todos os pontos?")) return;
    try {
      await axios.post(`${API}/competition/end`);
      toast.success("Competição encerrada!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao encerrar competição");
    }
  };

  const handleViewHistory = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await axios.get(`${API}/students/${student.id}/history`);
      setStudentHistory(res.data);
      setShowHistory(true);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-mario-red', 'bg-mario-blue', 'bg-coin-gold', 'bg-pipe-green'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-pixel text-white text-xl">CARREGANDO...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black p-6 pixel-shadow mb-8" data-testid="dashboard-header">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-coin-gold border-4 border-black p-4 pixel-shadow-sm">
                <Music className="w-8 h-8" strokeWidth={3} />
              </div>
              <div>
                <h1 className="font-pixel text-xl md:text-2xl">MUSIC RANKING</h1>
                <p className="font-retro text-xl">Olá, Professor {user?.name}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-mario-red text-white font-pixel text-xs py-3 px-5 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" strokeWidth={3} />
              SAIR
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/manage-criteria")}
            className="bg-coin-gold text-black font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all flex items-center justify-center gap-3"
            data-testid="manage-criteria-button"
          >
            <Edit className="w-5 h-5" strokeWidth={3} />
            GERENCIAR QUESITOS
          </button>
          <button
            onClick={() => setShowAddStudent(true)}
            className="bg-pipe-green text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all flex items-center justify-center gap-3"
            data-testid="add-student-button"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            ADICIONAR ALUNO
          </button>
          <button
            onClick={() => setShowScoreForm(true)}
            className="bg-mario-blue text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all flex items-center justify-center gap-3"
            data-testid="add-score-button"
          >
            <Star className="w-5 h-5" strokeWidth={3} />
            ADICIONAR PONTOS
          </button>
          <button
            onClick={() => setShowChallengeForm(true)}
            className="bg-mario-red text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all flex items-center justify-center gap-3"
            data-testid="manage-challenge-button"
          >
            <Target className="w-5 h-5" strokeWidth={3} />
            DESAFIO DO MÊS
          </button>
        </div>

        {/* Current Challenge */}
        {challenge && (
          <div className="bg-coin-gold border-4 border-black p-6 pixel-shadow mb-8" data-testid="current-challenge">
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-pixel text-lg flex items-center gap-2">
                <Target className="w-6 h-6" strokeWidth={3} />
                DESAFIO DO MÊS
              </h2>
              <button
                onClick={handleDeleteChallenge}
                className="p-2 border-2 border-black bg-mario-red hover:bg-red-700 pixel-shadow-sm"
                data-testid="delete-challenge-button"
                title="Excluir desafio"
              >
                <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </div>
            <h3 className="font-retro text-2xl mb-2">{challenge.title}</h3>
            <p className="font-retro text-xl mb-2">{challenge.description}</p>
            <div className="bg-black text-coin-gold px-3 py-1 font-pixel text-xs inline-block border-2 border-white">
              {challenge.points} PONTOS
            </div>
          </div>
        )}

        {/* Students List */}
        <div className="bg-white border-4 border-black p-6 pixel-shadow mb-8" data-testid="students-list">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-pixel text-lg flex items-center gap-2">
              <Trophy className="w-6 h-6" strokeWidth={3} />
              RANKING ({students.length} alunos)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdjustPoints(true)}
                className="bg-mario-blue text-white font-pixel text-[10px] py-2 px-4 border-2 border-black pixel-shadow-sm hover:translate-y-[1px] transition-all"
                data-testid="adjust-points-button"
              >
                AJUSTAR PONTOS
              </button>
              <button
                onClick={handleEndCompetition}
                className="bg-mario-red text-white font-pixel text-[10px] py-2 px-4 border-2 border-black pixel-shadow-sm hover:translate-y-[1px] transition-all"
                data-testid="end-competition-button"
              >
                ENCERRAR
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {students.length === 0 ? (
              <p className="font-retro text-xl text-center py-8">Nenhum aluno cadastrado ainda.</p>
            ) : (
              students.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border-4 border-black pixel-shadow-sm hover:translate-x-1 transition-all"
                  data-testid={`student-card-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-pixel text-2xl text-gray-400 w-8">#{index + 1}</div>
                    <div className={`${getAvatarColor(student.name)} border-2 border-black w-12 h-12 flex items-center justify-center`}>
                      <span className="font-pixel text-white text-xl">{student.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-retro text-2xl">{student.name}</h3>
                      <div className="bg-black text-coin-gold px-2 py-1 font-pixel text-[10px] inline-block mt-1">
                        {student.total_points} PONTOS
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewHistory(student)}
                      className="p-2 border-2 border-black bg-white hover:bg-gray-100 pixel-shadow-sm"
                      data-testid={`view-history-${index}`}
                      title="Ver histórico"
                    >
                      <History className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 border-2 border-black bg-mario-red hover:bg-red-700 pixel-shadow-sm"
                      data-testid={`delete-student-${index}`}
                      title="Remover aluno"
                    >
                      <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* View Public Ranking */}
        <div className="text-center">
          <button
            onClick={() => navigate("/ranking")}
            className="font-retro text-xl text-white hover:text-coin-gold transition-colors underline"
            data-testid="view-public-ranking-button"
          >
            Ver Ranking Público (Visão dos Alunos)
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddStudent && (
        <Modal onClose={() => setShowAddStudent(false)} title="ADICIONAR ALUNO">
          <form onSubmit={handleAddStudent}>
            <label className="font-retro text-xl block mb-2">Nome do Aluno:</label>
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm mb-4"
              required
              data-testid="new-student-name-input"
              placeholder="Digite o nome"
            />
            <button
              type="submit"
              className="w-full bg-pipe-green text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all"
              data-testid="submit-new-student"
            >
              ADICIONAR
            </button>
          </form>
        </Modal>
      )}

      {showScoreForm && (
        <ScoreFormModal
          students={students}
          criteria={criteria}
          scoreForm={scoreForm}
          setScoreForm={setScoreForm}
          onSubmit={handleSubmitScore}
          onClose={() => setShowScoreForm(false)}
        />
      )}

      {showChallengeForm && (
        <ChallengeFormModal
          challengeForm={challengeForm}
          setChallengeForm={setChallengeForm}
          onSubmit={handleSubmitChallenge}
          onClose={() => setShowChallengeForm(false)}
          existingChallenge={challenge}
        />
      )}

      {showAdjustPoints && (
        <AdjustPointsModal
          students={students}
          adjustForm={adjustForm}
          setAdjustForm={setAdjustForm}
          onSubmit={handleAdjustPoints}
          onClose={() => setShowAdjustPoints(false)}
        />
      )}

      {showHistory && (
        <HistoryModal
          student={selectedStudent}
          history={studentHistory}
          criteria={criteria}
          onClose={() => {
            setShowHistory(false);
            setSelectedStudent(null);
            setStudentHistory([]);
          }}
        />
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ children, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white border-4 border-black pixel-shadow p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="modal"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-pixel text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 border-2 border-black bg-white hover:bg-gray-100 pixel-shadow-sm"
            data-testid="close-modal-button"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Score Form Modal
const ScoreFormModal = ({ students, criteria, scoreForm, setScoreForm, onSubmit, onClose }) => {
  return (
    <Modal onClose={onClose} title="ADICIONAR PONTOS">
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="font-retro text-xl block mb-2">Selecione o Aluno:</label>
          <select
            value={scoreForm.student_id}
            onChange={(e) => setScoreForm({ ...scoreForm, student_id: e.target.value })}
            className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
            required
            data-testid="select-student"
          >
            <option value="">-- Escolha um aluno --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {criteria.length === 0 ? (
          <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-600">
            <p className="font-retro text-lg">Nenhum quesito cadastrado. Adicione quesitos primeiro!</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="flex items-center justify-between">
                <label className="font-retro text-lg flex-1">{criterion.name}:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={criterion.max_points}
                    value={scoreForm.scores[criterion.id] || 0}
                    onChange={(e) => setScoreForm({ 
                      ...scoreForm, 
                      scores: { 
                        ...scoreForm.scores, 
                        [criterion.id]: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="w-20 bg-white border-4 border-black p-2 font-retro text-xl text-center focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
                    data-testid={`score-input-${criterion.id}`}
                  />
                  <span className="font-retro text-lg text-gray-500">/ {criterion.max_points}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="challenge"
            checked={scoreForm.challenge_completed}
            onChange={(e) => setScoreForm({ ...scoreForm, challenge_completed: e.target.checked })}
            className="w-6 h-6 border-4 border-black"
            data-testid="challenge-completed-checkbox"
          />
          <label htmlFor="challenge" className="font-retro text-xl">
            Completou o desafio do mês
          </label>
        </div>

        <button
          type="submit"
          disabled={criteria.length === 0}
          className="w-full bg-mario-blue text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="submit-score-button"
        >
          SALVAR PONTOS
        </button>
      </form>
    </Modal>
  );
};

// Challenge Form Modal
const ChallengeFormModal = ({ challengeForm, setChallengeForm, onSubmit, onClose, existingChallenge }) => {
  useEffect(() => {
    if (existingChallenge) {
      setChallengeForm({
        title: existingChallenge.title,
        description: existingChallenge.description,
        points: existingChallenge.points
      });
    }
  }, [existingChallenge]);

  return (
    <Modal onClose={onClose} title="DESAFIO DO MÊS">
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="font-retro text-xl block mb-2">Título:</label>
          <input
            type="text"
            value={challengeForm.title}
            onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
            className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
            required
            data-testid="challenge-title-input"
            placeholder="Ex: Tocar escala de Dó maior"
          />
        </div>

        <div className="mb-4">
          <label className="font-retro text-xl block mb-2">Descrição:</label>
          <textarea
            value={challengeForm.description}
            onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
            className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
            rows="4"
            required
            data-testid="challenge-description-input"
            placeholder="Descreva o desafio..."
          />
        </div>

        <div className="mb-4">
          <label className="font-retro text-xl block mb-2">Pontos:</label>
          <input
            type="number"
            min="1"
            value={challengeForm.points}
            onChange={(e) => setChallengeForm({ ...challengeForm, points: parseInt(e.target.value) || 1 })}
            className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
            required
            data-testid="challenge-points-input"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-coin-gold text-black font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all"
          data-testid="submit-challenge-button"
        >
          SALVAR DESAFIO
        </button>
      </form>
    </Modal>
  );
};

// Adjust Points Modal
const AdjustPointsModal = ({ students, adjustForm, setAdjustForm, onSubmit, onClose }) => {
  return (
    <Modal onClose={onClose} title="AJUSTAR PONTOS">
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="font-retro text-xl block mb-2">Selecione o Aluno:</label>
          <select
            value={adjustForm.student_id}
            onChange={(e) => setAdjustForm({ ...adjustForm, student_id: e.target.value })}
            className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
            required
            data-testid="adjust-select-student"
          >
            <option value="">-- Escolha um aluno --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.total_points} pontos)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="font-retro text-xl block mb-2">Pontos (+ para adicionar, - para remover):</label>
          <input
            type="number"
            value={adjustForm.points}
            onChange={(e) => setAdjustForm({ ...adjustForm, points: parseInt(e.target.value) || 0 })}
            className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
            required
            data-testid="adjust-points-input"
            placeholder="Ex: 5 ou -3"
          />
        </div>

        <div className="mb-4">
          <label className="font-retro text-xl block mb-2">Motivo (opcional):</label>
          <input
            type="text"
            value={adjustForm.reason}
            onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
            className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
            data-testid="adjust-reason-input"
            placeholder="Ex: Correção de erro"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAdjustForm({ ...adjustForm, points: 5 })}
            className="flex-1 bg-pipe-green text-white font-pixel text-[10px] py-3 px-4 border-2 border-black pixel-shadow-sm hover:translate-y-[1px] transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" strokeWidth={3} />
            +5
          </button>
          <button
            type="button"
            onClick={() => setAdjustForm({ ...adjustForm, points: -5 })}
            className="flex-1 bg-mario-red text-white font-pixel text-[10px] py-3 px-4 border-2 border-black pixel-shadow-sm hover:translate-y-[1px] transition-all flex items-center justify-center gap-2"
          >
            <TrendingDown className="w-4 h-4" strokeWidth={3} />
            -5
          </button>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-mario-blue text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all"
          data-testid="submit-adjust-button"
        >
          AJUSTAR
        </button>
      </form>
    </Modal>
  );
};

// History Modal
const HistoryModal = ({ student, history, criteria, onClose }) => {
  return (
    <Modal onClose={onClose} title={`HISTÓRICO - ${student?.name}`}>
      {history.length === 0 ? (
        <p className="font-retro text-xl text-center py-8">Nenhum histórico ainda.</p>
      ) : (
        <div className="space-y-4">
          {history.map((record, index) => (
            <div key={record.id} className="border-4 border-black p-4 pixel-shadow-sm" data-testid={`history-record-${index}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-retro text-lg">
                    Semana: {record.week_start_date} a {record.week_end_date}
                  </p>
                </div>
                <div className="bg-black text-coin-gold px-2 py-1 font-pixel text-[10px]">
                  {record.total_week_points} PTS
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-retro text-base">
                {criteria.map((criterion) => (
                  <div key={criterion.id}>
                    {criterion.name}: {record.scores[criterion.id] || 0}
                  </div>
                ))}
              </div>
              {record.challenge_completed && (
                <div className="mt-3 bg-coin-gold border-2 border-black p-2 font-retro text-lg">
                  ★ Desafio completo: +{record.challenge_points} pontos
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default Dashboard;