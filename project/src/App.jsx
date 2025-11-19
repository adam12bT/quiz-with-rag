import { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import AdminLobby from './pages/AdminLobby';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import End from './pages/End';
import useWebSocket from './hooks/useWebSocket';
import AIQuizGenerator from "./pages/quizadmin";


function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [serverCorrect, setServerCorrect] = useState(null);

  const processedMessages = useRef(new Set()); // ✅ prevent loops

  const { lastMessage, sendMessage } = useWebSocket('ws://10.105.173.73:8080');

  // 🔄 Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    const message = lastMessage.trim();
    if (processedMessages.current.has(message)) return;
    processedMessages.current.add(message);

    console.log('Processing message FRONT:', message);

    // 📜 Player list update
    if (message.startsWith('players:')) {
      const list = message.substring(8).split(',').filter(Boolean);
      console.log('Updated player list:', list);
      setPlayers(list);
    }

    // 👋 Player joined
    else if (message.includes('joined the game')) {
      const name = message
        .replace('broadcast:', '')
        .replace('joined the game', '')
        .trim();
      setPlayers(prev => (prev.includes(name) ? prev : [...prev, name]));
      console.log('Player joined:', name);
    }

    // ❓ New question
    else if (message.startsWith('question:')) {
      const full = message.substring(9);
      const splitIndex = full.indexOf(':');
      const qid = full.substring(0, splitIndex);
      const rest = full.substring(splitIndex + 1);
      const parts = rest.split('|');

      if (parts.length === 5) {
        const newQuestion = {
          id: qid,
          text: parts[0],
          options: [parts[1], parts[2], parts[3], parts[4]],
        };
        setCurrentQuestion(newQuestion);
        setServerCorrect(null); // reset

        // Only non-admins see the quiz
        if (!isAdmin) setCurrentPage('quiz');

        console.log('Received question:', newQuestion.text);
      }
    }

    // ⏰ Timer
    else if (message.startsWith('time:')) {
      const remaining = parseInt(message.substring(5));
      setTimeLeft(remaining);
    }

    // 🏆 Leaderboard
    else if (message.startsWith('leaderboard:')) {
      const data = message.substring(12);
      const entries = data.split('|').map(entry => {
        const [name, score] = entry.split(':');
        return { name, score: parseInt(score) || 0 };
      });
      setLeaderboardData(entries);
      setCurrentPage('leaderboard');
    }

    // 📢 Broadcasts
    else if (message.startsWith('broadcast:')) {
      const broadcastMsg = message.substring(10);
      console.log('Broadcast:', broadcastMsg);

      if (broadcastMsg.includes('ended') || broadcastMsg.includes('finished')) {
        setCurrentPage('end');
      } else if (broadcastMsg.includes("Time's up")) {
        const match = broadcastMsg.match(/Correct:\s*([A-D])/);
        const correct = match ? match[1] : null;

        if (!isAdmin) {
          setCurrentQuestion(prev => ({
            ...prev,
            correctAnswer: correct,
            showFeedback: true,
          }));
        }
      }
    }

    // ❌ Error
    else if (message.startsWith('error:')) {
      alert(message.substring(6));
    }
  }, [lastMessage]); // ✅ only triggers when a new message arrives

  // 🧍 Handle login
  const handleLogin = (user, admin) => {
    const trimmed = user.trim();
    if (!trimmed) return;

    setUsername(trimmed);
    setIsAdmin(admin);

    if (admin) {
      sendMessage(`create:${trimmed}`);
    } else {
      sendMessage(`join:${trimmed}`);
    }

    setPlayers(prev => [...prev, trimmed]);
    setCurrentPage('lobby');
  };

  // ▶️ Admin starts quiz
  const handleStartQuiz = () => sendMessage('start');

  // 🦶 Admin kicks player
  const handleKickPlayer = (playerName) => {
    sendMessage(`kick:${playerName}`);
    setPlayers(players.filter(p => p !== playerName));
  };

  // ✅ Player answers
  const handleAnswer = (questionId, choice) => {
    if (!username) return;
    sendMessage(`answer:${username}:${questionId}:${choice}`);
  };

  // 🔁 Replay
  const handlePlayAgain = () => {
    setCurrentPage('lobby');
    setCurrentQuestion(null);
    setLeaderboardData([]);
    setTimeLeft(0);
    setServerCorrect(null);
  };

  // 🚪 Exit
  const handleExit = () => {
    setCurrentPage('home');
    setUsername('');
    setIsAdmin(false);
    setPlayers([]);
    setCurrentQuestion(null);
    setLeaderboardData([]);
    setTimeLeft(0);
    setServerCorrect(null);
  };

  // 🖥️ Page rendering
  return (
    <>
      {currentPage === 'home' && (
        <Home onLogin={handleLogin} existingPlayers={players} />
      )}

      {currentPage === 'lobby' && (
        isAdmin ? (
          <AdminLobby
            players={players}
            onStartQuiz={handleStartQuiz}
            username={username}
            onKickPlayer={handleKickPlayer}
            onOpenAIQuiz={() => setCurrentPage("aiQuiz")} 

          />
        ) : (
          <Lobby
            players={players}
            isAdmin={isAdmin}
            onStartQuiz={handleStartQuiz}
            username={username}
          />
        )
      )}
      {currentPage === "aiQuiz" && (
  <AIQuizGenerator onBack={() => setCurrentPage("lobby")} />
)}


      {currentPage === 'quiz' && currentQuestion && (
        <Quiz
          question={currentQuestion}
          onAnswer={handleAnswer}
          timeLimit={timeLeft}
          serverCorrect={serverCorrect}
        />
      )}

      {currentPage === 'leaderboard' && (
        <Leaderboard players={leaderboardData} username={username} />
      )}

      {currentPage === 'end' && (
        <End
          players={leaderboardData}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
          username={username}
        />
      )}
    </>
  );
}

export default App;
