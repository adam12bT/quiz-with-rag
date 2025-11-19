import { useState } from "react";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";

function AIQuizGenerator({ onBack }) {
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧠 Parse quiz text from backend into structured question objects
  const parseQuiz = (data) => {
    const text = typeof data === "string" ? data : data.quiz;
    if (!text) return [];

    return text
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "")
      .map((line, index) => {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length < 7) return null;

        return {
          id: index + 1,
          question: parts[1],
          options: [
            parts[2].replace(/^A\)\s*/, ""),
            parts[3].replace(/^B\)\s*/, ""),
            parts[4].replace(/^C\)\s*/, ""),
            parts[5].replace(/^D\)\s*/, ""),
          ],
          answer: parts[6].trim(), // e.g. "C"
        };
      })
      .filter(Boolean);
  };


const setquiz= async () => {
  if (quiz.length === 0) {
    alert("No quiz to save!");
    return;
  }

  const newText = quiz
    .map(
      (q, i) =>
        `${i + 1}|${q.question}|A) ${q.options[0]}|B) ${q.options[1]}|C) ${q.options[2]}|D) ${q.options[3]}|${q.answer}`
    )
    .join("\n");

  const filePath = "C:/Users/adamb/Desktop/eya bo/backend/questions.txt"; // 👈 change path to your file

  try {
    const res = await fetch("http://127.0.0.1:8000/update_txt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newText,
        path: filePath,
      }),
    });

    const data = await res.json();
    if (data.status === "success") {
      alert("✅ File updated successfully!");
    } else {
      alert("❌ Error: " + data.message);
    }
  } catch (err) {
    console.error("Request failed:", err);
    alert("❌ Failed to reach backend.");
  }
};

  // 📤 Handle quiz generation request
  const handleGenerate = async () => {
    if (!file || !topic) {
      setError("Please select a PDF and enter a topic.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("topic", topic);

      const res = await fetch("http://127.0.0.1:8000/generate_quiz", {
        method: "POST",
        body: formData,
      });

      const data = await res.text();
      console.log("🔹 Raw backend response:", data);

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = { quiz: data };
      }

      if (parsedData.error) {
        setError(parsedData.error);
        setQuiz([]);
      } else {
        const parsedQuiz = parseQuiz(parsedData);
        if (parsedQuiz.length === 0) {
          setError("⚠️ Could not parse any quiz questions from the response.");
        }
        setQuiz(parsedQuiz);
      }
    } catch (err) {
      setError("Error generating quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl relative">
        {/* 🔙 Back button */}
        <button
          onClick={onBack}
          className="absolute top-5 left-5 text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Lobby
        </button>

        {/* ✨ Header */}
        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-800">
              AI Quiz Generator
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Upload a PDF and let AI create a quiz for you.
          </p>
        </div>

        {/* 📁 File & Topic inputs */}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full mb-3 text-sm text-gray-700"
        />
        {file && (
          <p className="text-sm text-gray-500 mb-3">
            📄 Selected: <b>{file.name}</b>
          </p>
        )}
        <input
          type="text"
          placeholder="Enter topic (e.g., Transport Layer)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-3"
        />

        {/* 🚀 Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <FileText className="w-5 h-5" />
          {loading ? "Generating..." : "Generate Quiz"}
        </button>

        {/* ⚠️ Error message */}
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}

        {/* 📋 Quiz display */}
        {quiz.length > 0 && (
          <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {quiz.map((q, i) => (
              <div
                key={q.id}
                className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-3">
                  {i + 1}. {q.question}
                </h3>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isCorrect = letter === q.answer;

                    return (
                      <li
                        key={idx}
                        className={`px-3 py-2 rounded-lg text-sm border shadow-sm transition-all ${
                          isCorrect
                            ? "bg-green-100 border-green-400 text-green-800 font-semibold"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                      >
                        {letter} {opt}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 text-sm text-green-700 font-medium">
                  ✅ Correct Answer: <b>{q.answer}</b>
                </div>
              </div>
            ))}
             <button
          onClick={setquiz}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
        >
          Use The Generated Quiz
        </button>
          </div>
          
        )}
          
      </div>
    </div>
  );
}

export default AIQuizGenerator;
