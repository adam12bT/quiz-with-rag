import { Trophy, RotateCcw, LogOut, Sparkles } from 'lucide-react';

function End({ players, onPlayAgain, onExit, username }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isWinner = winner?.name === username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 animate-ping bg-yellow-400 rounded-full opacity-20"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            Quiz Finished <Sparkles className="w-8 h-8 text-yellow-500" />
          </h1>

          {winner && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-4 mb-4 inline-block">
              <p className="text-lg font-semibold text-gray-800">
                {isWinner ? (
                  <>🎉 Congratulations! You won with {winner.score} points!</>
                ) : (
                  <>👑 Winner: <span className="text-orange-600">{winner.name}</span> with {winner.score} points</>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Final Standings</h2>

          <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => {
                const isCurrentUser = player.name === username;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                        : 'bg-white'
                    } ${isCurrentUser ? 'ring-4 ring-blue-400' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                      index < 3 ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-500 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                      'bg-gradient-to-br from-blue-400 to-purple-500'
                    }`}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="font-bold text-lg flex items-center gap-2">
                        {player.name}
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">You</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">{player.score}</div>
                      <div className={`text-sm ${index < 3 ? 'opacity-80' : 'text-gray-500'}`}>points</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-6 h-6" />
            Play Again
          </button>

          <button
            onClick={onExit}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-6 h-6" />
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default End;
