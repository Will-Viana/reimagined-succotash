import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, setAuthToken } from "../App";
import { toast } from "sonner";
import { Music, LogIn, UserPlus } from "lucide-react";

const Login = ({ setIsAuthenticated }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    instrument: "Violino"
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { email: formData.email, password: formData.password, name: formData.name, instrument: formData.instrument }
        : { email: formData.email, password: formData.password };

      const response = await axios.post(`${API}${endpoint}`, payload);
      const { access_token } = response.data;

      setAuthToken(access_token);
      setIsAuthenticated(true);
      toast.success(isRegister ? "Cadastro realizado!" : "Login realizado!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-coin-gold border-4 border-black p-6 pixel-shadow mb-4">
            <Music className="w-12 h-12" strokeWidth={3} />
          </div>
          <h1 className="font-pixel text-2xl md:text-3xl text-white mb-2 tracking-wide" data-testid="app-title">
            MUSIC RANKING
          </h1>
          <p className="font-retro text-xl text-white">Sistema de Ranking</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-4 border-black p-8 pixel-shadow" data-testid="login-form">
          <h2 className="font-pixel text-lg mb-6 text-center">
            {isRegister ? "REGISTRAR" : "LOGIN"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="font-retro text-xl block mb-2">Nome:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
                    required={isRegister}
                    data-testid="name-input"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label className="font-retro text-xl block mb-2">Instrumento/Matéria:</label>
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
                    required={isRegister}
                    data-testid="instrument-input"
                    placeholder="Ex: Violino, Piano, Guitarra..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="font-retro text-xl block mb-2">Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
                required
                data-testid="email-input"
                placeholder="professor@email.com"
              />
            </div>

            <div>
              <label className="font-retro text-xl block mb-2">Senha:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-retro text-xl focus:ring-0 focus:border-mario-red outline-none pixel-shadow-sm"
                required
                data-testid="password-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mario-red text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover active:translate-y-[4px] active:shadow-none transition-all uppercase flex items-center justify-center gap-3"
              data-testid="submit-button"
            >
              {isRegister ? (
                <>
                  <UserPlus className="w-5 h-5" strokeWidth={3} />
                  {loading ? "Carregando..." : "Registrar"}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" strokeWidth={3} />
                  {loading ? "Carregando..." : "Entrar"}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="font-retro text-lg text-mario-blue hover:text-mario-red transition-colors underline"
              data-testid="toggle-form-button"
            >
              {isRegister ? "Já tem conta? Fazer login" : "Não tem conta? Registrar"}
            </button>
          </div>
        </div>

        {/* Public Ranking Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/ranking")}
            className="font-retro text-xl text-white hover:text-coin-gold transition-colors underline"
            data-testid="public-ranking-link"
          >
            Ver Ranking Público
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;