import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

function Quiz({ question, onAnswer, timeLimit = 20 }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(question.correct || null);

  // 🔁 Reset on new question
  useEffect(() => {
    setTimeLeft(timeLimit);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswer(question.correct || null);
  }, [question, timeLimit]);

  // ⏱️ Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !selectedAnswer) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, selectedAnswer]);

  // 🧠 If App updates the question with a correct answer (e.g., broadcast)
  useEffect(() => {
    if (question.correct && question.correct !== correctAnswer) {
      setCorrectAnswer(question.correct);
      setShowResult(true);
    }
  }, [question.correct]);

  const handleAnswerClick = (choice) => {
    if (selectedAnswer || timeLeft === 0) return;
    setSelectedAnswer(choice);
    onAnswer(question.id, choice);

    // show local result if we already have correct info
    if (correctAnswer) {
      setShowResult(true);
    }
  };

  const progressPercentage = (timeLeft / timeLimit) * 100;
  const choices = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600">
              Question {question.number || 1}
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                timeLeft <= 5
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              <Clock
                className={`w-5 h-5 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
              />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                timeLeft <= 5
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {question.text || 'Loading question...'}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrect = showResult && correctAnswer === choice;
            const isWrong =
              showResult && isSelected && correctAnswer !== choice;

            return (
              <button
                key={choice}
                onClick={() => handleAnswerClick(choice)}
                disabled={selectedAnswer !== null || timeLeft === 0}
                className={`p-6 rounded-xl border-3 font-semibold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-4 ${
                  isCorrect
                    ? 'bg-green-500 text-white border-green-600 shadow-lg'
                    : isWrong
                    ? 'bg-red-500 text-white border-red-600 shadow-lg'
                    : isSelected
                    ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                    : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50'
                } ${
                  selectedAnswer !== null || timeLeft === 0
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    isCorrect || isWrong || isSelected
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br from-blue-400 to-purple-600 text-white'
                  }`}
                >
                  {choice}
                </div>
                <span className="flex-1 text-left">
                  {question.options?.[index] || `Option ${choice}`}
                </span>
                {isCorrect && <CheckCircle className="w-6 h-6 flex-shrink-0" />}
                {isWrong && <XCircle className="w-6 h-6 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Result Feedback */}
        {showResult && correctAnswer && (
          <div
            className={`mt-6 p-4 rounded-xl text-center font-medium ${
              selectedAnswer === correctAnswer
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {selectedAnswer === correctAnswer
              ? '🎉 Correct! Well done!'
              : `❌ Wrong! The correct answer was ${correctAnswer}`}
          </div>
        )}

        {/* Time’s Up */}
        {timeLeft === 0 && !selectedAnswer && correctAnswer && (
          <div className="mt-6 p-4 rounded-xl text-center font-medium bg-orange-100 text-orange-800">
            ⏰ Time’s up! The correct answer was {correctAnswer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
