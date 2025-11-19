import { Crown, Users, Play, Settings, Trash2,Sparkles } from 'lucide-react';

function AdminLobby({ players, onStartQuiz, username, onKickPlayer,onOpenAIQuiz  }) {
  const handleKickPlayer = (player) => {
    if (player !== username && onKickPlayer) {
      onKickPlayer(player);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-800">Admin Lobby</h1>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Waiting for players to join your game
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Players ({players.length})
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Settings className="w-4 h-4" />
              <span>Manage Players</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto">
            {players.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Waiting for players to join...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player, index) => {
                  const isYou = player === username;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                        isYou
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300'
                          : 'bg-white hover:bg-gray-100'
                      }`}


                    


                      
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${
                          isYou
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-br from-blue-400 to-purple-500'
                        }`}
                      >
                        {player.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{player}</span>
                          {isYou && (
                            <div className="flex items-center gap-1">
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-medium">
                                Admin
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {isYou ? 'Game Host' : 'Player'}
                        </div>
                      </div>

                      {!isYou && (
                        <button
                          onClick={() => handleKickPlayer(player)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-all group"
                          title="Remove player"
                        >
                          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">

            <button
            onClick={onOpenAIQuiz}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate AI Quiz
          </button>

          <button
            onClick={onStartQuiz}
            disabled={players.length < 1}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none inline-flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            Start Quiz
          </button>


          {players.length < 1 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-800">
                💡 You can start the quiz anytime. Waiting for more players is optional!
              </p>
            </div>
          )}

          {players.length === 1 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
              <p className="text-sm text-orange-800">
                ⚠️ Only you are in the game. Consider waiting for more players to join!
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{players.length}</div>
            <div className="text-xs text-gray-600">Players Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLobby;
