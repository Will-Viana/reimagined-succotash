import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Music, Trophy, Star, Medal, Crown, Home } from "lucide-react";

const PublicRanking = () => {
  const [students, setStudents] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRanking();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRanking, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRanking = async () => {
    try {
      const [rankingRes, challengeRes, criteriaRes] = await Promise.all([
        axios.get(`${API}/ranking/public`),
        axios.get(`${API}/challenge`),
        axios.get(`${API}/criteria/public`)
      ]);
      setStudents(rankingRes.data);
      setChallenge(challengeRes.data);
      setCriteria(criteriaRes.data);
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position) => {
    if (position === 0) return <Crown className="w-8 h-8 text-coin-gold" strokeWidth={3} />;
    if (position === 1) return <Medal className="w-8 h-8 text-gray-400" strokeWidth={3} />;
    if (position === 2) return <Medal className="w-8 h-8 text-orange-700" strokeWidth={3} />;
    return null;
  };

  const getPositionBg = (position) => {
    if (position === 0) return "bg-coin-gold";
    if (position === 1) return "bg-gray-200";
    if (position === 2) return "bg-orange-200";
    return "bg-white";
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-mario-red', 'bg-mario-blue', 'bg-pipe-green', 'bg-coin-gold'];
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-coin-gold border-4 border-black p-6 pixel-shadow mb-4 coin-bounce">
            <Trophy className="w-16 h-16" strokeWidth={3} />
          </div>
          <h1 className="font-pixel text-3xl md:text-4xl text-white mb-3 tracking-wide" data-testid="ranking-title">
            RANKING MUSIC RANKING
          </h1>
          <p className="font-retro text-2xl text-white">Luta pela liderança!</p>
        </div>

        {/* Challenge Banner */}
        {challenge && (
          <div className="bg-mario-red border-4 border-black p-6 pixel-shadow mb-8 animate-pulse" data-testid="challenge-banner">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-coin-gold" strokeWidth={3} />
              <h2 className="font-pixel text-lg text-white">DESAFIO DO MÊS</h2>
            </div>
            <h3 className="font-retro text-2xl text-white mb-2">{challenge.title}</h3>
            <p className="font-retro text-xl text-white mb-3">{challenge.description}</p>
            <div className="bg-coin-gold text-black px-3 py-2 font-pixel text-xs inline-block border-2 border-black">
              VALE {challenge.points} PONTOS!
            </div>
          </div>
        )}

        {/* Ranking List */}
        <div className="bg-white border-4 border-black p-6 md:p-8 pixel-shadow mb-8" data-testid="ranking-list">
          <h2 className="font-pixel text-xl mb-6 text-center flex items-center justify-center gap-3">
            <Trophy className="w-6 h-6" strokeWidth={3} />
            PLACAR OFICIAL
            <Trophy className="w-6 h-6" strokeWidth={3} />
          </h2>

          {students.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-retro text-2xl mb-4">Nenhum aluno no ranking ainda.</p>
              <p className="font-retro text-xl text-gray-600">Seja o primeiro a pontuar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className={`${getPositionBg(index)} border-4 border-black pixel-shadow p-4 md:p-6 hover:scale-105 transition-transform`}
                  data-testid={`ranking-item-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6 flex-1">
                      {/* Position */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        {getMedalIcon(index)}
                        <span className="font-pixel text-2xl md:text-3xl mt-2">#{index + 1}</span>
                      </div>

                      {/* Avatar */}
                      <div className={`${getAvatarColor(student.name)} border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center pixel-shadow`}>
                        <span className="font-pixel text-white text-2xl md:text-3xl">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="flex-1">
                        <h3 className="font-retro text-2xl md:text-3xl break-words">{student.name}</h3>
                        {index === 0 && (
                          <p className="font-pixel text-[10px] text-coin-gold mt-1">★ LIDER ★</p>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="bg-black border-4 border-white px-4 py-3 pixel-shadow-sm">
                      <div className="text-center">
                        <div className="font-pixel text-coin-gold text-2xl md:text-3xl">{student.total_points}</div>
                        <div className="font-pixel text-white text-[8px] md:text-[10px] mt-1">PONTOS</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Criteria Reference */}
        <div className="bg-mario-blue border-4 border-black p-6 pixel-shadow mb-8" data-testid="criteria-reference">
          <h3 className="font-pixel text-lg text-white mb-4 text-center">COMO GANHAR PONTOS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-retro text-lg text-white">
            <div className="flex justify-between border-2 border-white p-2">
              <span>Postura</span>
              <span className="font-pixel text-coin-gold text-sm">3 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Afinação</span>
              <span className="font-pixel text-coin-gold text-sm">3 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Execução em sala</span>
              <span className="font-pixel text-coin-gold text-sm">4 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Música pronta</span>
              <span className="font-pixel text-coin-gold text-sm">4 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Estudos todos os dias</span>
              <span className="font-pixel text-coin-gold text-sm">6 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Estudos parciais</span>
              <span className="font-pixel text-coin-gold text-sm">2 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Pílulas da semana</span>
              <span className="font-pixel text-coin-gold text-sm">5 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Obediência em sala</span>
              <span className="font-pixel text-coin-gold text-sm">6 pts</span>
            </div>
            <div className="flex justify-between border-2 border-white p-2">
              <span>Prática dos violinos</span>
              <span className="font-pixel text-coin-gold text-sm">1 pt</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="font-retro text-xl text-white">
            Continue se esforçando e suba no ranking!
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-pipe-green text-white font-pixel text-xs py-4 px-6 border-4 border-black pixel-shadow hover:translate-y-[2px] hover:pixel-shadow-hover transition-all inline-flex items-center gap-2"
            data-testid="back-to-login-button"
          >
            <Home className="w-5 h-5" strokeWidth={3} />
            PAINEL DO PROFESSOR
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicRanking;