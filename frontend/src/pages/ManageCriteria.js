import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Music } from "lucide-react";

const ManageCriteria = () => {
  const [criteria, setCriteria] = useState([]);
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", max_points: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCriterion, setNewCriterion] = useState({ name: "", max_points: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, criteriaRes] = await Promise.all([
        axios.get(`${API}/auth/me`),
        axios.get(`${API}/criteria`)
      ]);
      setUser(userRes.data);
      setCriteria(criteriaRes.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriterion = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/criteria`, newCriterion);
      toast.success("Quesito adicionado!");
      setNewCriterion({ name: "", max_points: 1 });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao adicionar quesito");
    }
  };

  const handleStartEdit = (criterion) => {
    setEditingId(criterion.id);
    setEditForm({ name: criterion.name, max_points: criterion.max_points });
  };

  const handleSaveEdit = async (criterionId) => {
    try {
      await axios.put(`${API}/criteria/${criterionId}`, {
        id: criterionId,
        ...editForm
      });
      toast.success("Quesito atualizado!");
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error("Erro ao atualizar quesito");
    }
  };

  const handleDelete = async (criterionId) => {
    if (!window.confirm("Tem certeza que deseja excluir este quesito?")) return;
    try {
      await axios.delete(`${API}/criteria/${criterionId}`);
      toast.success("Quesito excluído!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao excluir quesito");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-pixel text-white text-xl">CARREGANDO...</div>
      </div>
    );
  }

  const totalPoints = criteria.reduce((sum, c) => sum + c.max_points, 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black p-6 pixel-shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 border-2 border-black bg-white hover:bg-gray-100 pixel-shadow-sm"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-coin-gold border-4 border-black p-4 pixel-shadow-sm">
                <Music className="w-8 h-8" strokeWidth={3} />
              </div>
              <div>
                <h1 className="font-pixel text-xl md:text-2xl">GERENCIAR QUESITOS</h1>
                <p className="font-retro text-xl">{user?.name} - {user?.instrument}</p>
              </div>
            </div>
            <div className="w-12"></div>
          </div>
        </div>

        {/* Total Points Info */}
        <div className="bg-mario-blue border-4 border-black p-4 pixel-shadow mb-6 text-center">
          <p className="font-pixel text-white text-lg">
            TOTAL MÁXIMO SEMANAL: {totalPoints} PONTOS
          </p>
        </div>

        {/* Add Criterion Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-pipe-green text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all flex items-center justify-center gap-3 mb-6"
            data-testid="show-add-form-button"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            ADICIONAR QUESITO
          </button>
        )}

        {/* Add Criterion Form */}
        {showAddForm && (
          <div className="bg-white border-4 border-black p-6 pixel-shadow mb-6" data-testid="add-criterion-form">
            <h2 className="font-pixel text-lg mb-4">NOVO QUESITO</h2>
            <form onSubmit={handleAddCriterion} className="space-y-4">
              <div>
                <label className="font-retro text-xl block mb-2">Nome do Quesito:</label>
                <input
                  type="text"
                  value={newCriterion.name}
                  onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
                  className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
                  required
                  data-testid="new-criterion-name"
                  placeholder="Ex: Técnica de arco"
                />
              </div>
              <div>
                <label className="font-retro text-xl block mb-2">Pontos Máximos:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newCriterion.max_points}
                  onChange={(e) => setNewCriterion({ ...newCriterion, max_points: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
                  required
                  data-testid="new-criterion-points"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-pipe-green text-white font-pixel text-xs py-3 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all"
                  data-testid="submit-new-criterion"
                >
                  SALVAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCriterion({ name: "", max_points: 1 });
                  }}
                  className="flex-1 bg-mario-red text-white font-pixel text-xs py-3 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Criteria List */}
        <div className="bg-white border-4 border-black p-6 pixel-shadow">
          <h2 className="font-pixel text-lg mb-6">QUESITOS ATUAIS ({criteria.length})</h2>
          
          {criteria.length === 0 ? (
            <p className="font-retro text-xl text-center py-8">Nenhum quesito cadastrado ainda.</p>
          ) : (
            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className="flex items-center justify-between p-4 border-4 border-black pixel-shadow-sm"
                  data-testid={`criterion-item-${index}`}
                >
                  {editingId === criterion.id ? (
                    // Edit Mode
                    <div className="flex-1 flex items-center gap-4">
                      <span className="font-pixel text-xl text-gray-400 w-8">#{index + 1}</span>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="flex-1 bg-white border-2 border-black p-2 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none"
                        data-testid={`edit-name-${index}`}
                      />
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editForm.max_points}
                        onChange={(e) => setEditForm({ ...editForm, max_points: parseInt(e.target.value) || 1 })}
                        className="w-20 bg-white border-2 border-black p-2 font-retro text-xl text-center focus:ring-0 focus:border-mario-red outline-none"
                        data-testid={`edit-points-${index}`}
                      />
                      <span className="font-retro text-lg">pts</span>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center gap-4">
                      <span className="font-pixel text-xl text-gray-400 w-8">#{index + 1}</span>
                      <div>
                        <h3 className="font-retro text-2xl">{criterion.name}</h3>
                        <span className="bg-black text-coin-gold px-2 py-1 font-pixel text-[10px] inline-block mt-1">
                          {criterion.max_points} PONTOS
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingId === criterion.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(criterion.id)}
                          className="p-2 border-2 border-black bg-pipe-green hover:bg-green-700 pixel-shadow-sm"
                          data-testid={`save-edit-${index}`}
                          title="Salvar"
                        >
                          <Save className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 border-2 border-black bg-gray-400 hover:bg-gray-500 pixel-shadow-sm"
                          title="Cancelar"
                        >
                          <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(criterion)}
                          className="p-2 border-2 border-black bg-mario-blue hover:bg-blue-700 pixel-shadow-sm"
                          data-testid={`edit-criterion-${index}`}
                          title="Editar"
                        >
                          <Edit className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(criterion.id)}
                          className="p-2 border-2 border-black bg-mario-red hover:bg-red-700 pixel-shadow-sm"
                          data-testid={`delete-criterion-${index}`}
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-coin-gold border-4 border-black p-6 pixel-shadow mt-6">
          <h3 className="font-pixel text-lg mb-3">DICAS</h3>
          <ul className="font-retro text-xl space-y-2">
            <li>• Personalize os quesitos para seu instrumento</li>
            <li>• Edite os nomes e pontos a qualquer momento</li>
            <li>• Pontuações antigas não serão afetadas</li>
            <li>• Máximo recomendado: 10 pontos por quesito</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageCriteria;