import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

function Leaderboard({ players, username }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getMedalIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getPositionStyle = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 2:
        return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
      default:
        return 'bg-white text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Current standings</p>
        </div>

        <div className="space-y-3">
          {sortedPlayers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No scores yet...</p>
          ) : (
            sortedPlayers.map((player, index) => {
              const isCurrentUser = player.name === username;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all transform ${
                    getPositionStyle(index)
                  } ${isCurrentUser ? 'ring-4 ring-blue-400' : ''}`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 font-bold text-xl">
                    {index < 3 ? (
                      getMedalIcon(index)
                    ) : (
                      <span>{index + 1}</span>
                    )}
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
                    <div className={`text-2xl font-bold ${index === 0 ? 'text-3xl' : ''}`}>
                      {player.score}
                    </div>
                    <div className={`text-sm ${index < 3 ? 'opacity-80' : 'text-gray-500'}`}>
                      points
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {sortedPlayers.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl text-center">
            <p className="text-sm text-gray-700">
              🎯 Top score: <span className="font-bold">{sortedPlayers[0]?.score || 0} points</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
