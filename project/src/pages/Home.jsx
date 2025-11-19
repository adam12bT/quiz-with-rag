import { useState, useEffect } from 'react';
import { Gamepad2, Users, AlertCircle } from 'lucide-react';

function Home({ onLogin, existingPlayers = [] }) {
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState('choose');
  const [error, setError] = useState('');

  // Validate username whenever it changes
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('');
    } else if (existingPlayers.includes(trimmed)) {
      setError('⚠️ This username already exists. Please choose another one.');
    } else {
      setError('');
    }
  }, [username, existingPlayers]);

  const handleCreateGame = () => {
    if (!username.trim() || error) return; // only send if valid
    onLogin(username.trim(), true);
  };

  const handleJoinGame = () => {
    if (!username.trim() || error) return; // only send if valid
    onLogin(username.trim(), false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'join') handleJoinGame();
      else if (mode === 'create') handleCreateGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mb-4 shadow-lg">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">MultiPlayer Quiz Game</h1>
          <p className="text-gray-600">Test your knowledge in real-time!</p>
        </div>

        <div className="space-y-2 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your username"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
              error ? 'border-red-400' : 'border-gray-300'
            }`}
            maxLength={20}
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {mode === 'choose' ? (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              Create Game
            </button>

            <button
              onClick={() => setMode('join')}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Join Game
            </button>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Enter your username first</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === 'create' ? (
              <button
                onClick={handleCreateGame}
                disabled={!username.trim() || !!error}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-6 h-6" />
                Create New Game
              </button>
            ) : (
              <button
                onClick={handleJoinGame}
                disabled={!username.trim() || !!error}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Users className="w-6 h-6" />
                Join Game
              </button>
            )}

            <button
              onClick={() => setMode('choose')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
