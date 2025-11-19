import { Crown, Users, Play, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function Lobby({ players, isAdmin, gameCode, onStartQuiz, username }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Game Lobby</h1>

          
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Players ({players.length})
            </h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Waiting for players to join...</p>
            ) : (
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      player === username
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-400 to-purple-500'
                    }`}>
                      {player.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 font-medium text-gray-800">{player}</span>
                    {index === 0 && (
                      <Crown className="w-5 h-5 text-yellow-500" title="Admin" />
                    )}
                    {player === username && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          {isAdmin ? (
            <button
              onClick={onStartQuiz}
              disabled={players.length < 2}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none inline-flex items-center gap-3"
            >
              <Play className="w-6 h-6" />
              Start Quiz
            </button>
          ) : (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full animation-delay-200"></div>
                <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full animation-delay-400"></div>
              </div>
              <p className="text-gray-700 font-medium">Waiting for admin to start the quiz...</p>
            </div>
          )}
        </div>

        {isAdmin && players.length < 2 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Need at least 2 players to start the quiz
          </p>
        )}
      </div>
    </div>
  );
}

export default Lobby;
