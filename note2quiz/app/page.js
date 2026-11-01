'use client';

import { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

// 1. Initialize the Gemini API client using your environment variable
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY });

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' or 'flashcards'
  const [flippedCards, setFlippedCards] = useState({});

  // --- LOCALSTORAGE: LOAD SAVED DATA ---
  useEffect(() => {
    const saved = localStorage.getItem('note2quiz_data');
    if (saved) {
      try {
        setQuizData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved quiz', e);
      }
    }
  }, []);

  // --- GEMINI API & JSON PARSING ---
  const generateQuiz = async () => {
    if (!notes.trim()) return alert('Please paste some notes first!');
    setLoading(true);

    const prompt = `
      You are an expert tutor. Analyze these notes and generate a quiz and flashcards.
      Return STRICT JSON ONLY. Do not include markdown code blocks (no \`\`\`json).
      
      Output format MUST be:
      {
        "title": "Topic Title",
        "questions": [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctIndex": 0,
            "explanation": "Why this answer is correct."
          }
        ],
        "flashcards": [
          { "front": "Term or Concept", "back": "Definition or Explanation" }
        ]
      }

      Notes:
      ${notes}
    `;

    try {
      const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      });

      // Clean string response to handle edge cases if Gemini wraps response in markdown
      let rawText = response.text.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      // Convert text to JavaScript object
      const parsedData = JSON.parse(rawText);

      // Update state and save to browser storage
      setQuizData(parsedData);
      localStorage.setItem('note2quiz_data', JSON.stringify(parsedData));
      
      // Reset quiz tracking states
      setScore(null);
      setSelectedAnswers({});
      setCurrentQuestion(0);
    } catch (err) {
      console.error(err);
      alert('Error generating quiz. Make sure your API key is correct and try again!');
    } finally {
      setLoading(false);
    }
  };

  // --- QUIZ LOGIC ---
  const handleSelectOption = (qIndex, oIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex });
  };

  const calculateScore = () => {
    let correctCount = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };

  const toggleFlashcard = (idx) => {
    setFlippedCards({ ...flippedCards, [idx]: !flippedCards[idx] });
  };

  // --- UI RENDER ---
  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 font-sans text-gray-800">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Note2Quiz</h1>
        <p className="text-gray-500">Turn your notes into instant quizzes & flashcards.</p>
      </header>

      {/* STEP 1: INPUT SECTION */}
      {!quizData && (
        <section className="bg-white p-6 rounded-xl shadow-md border">
          <label className="block font-semibold mb-2 text-lg">Paste your notes:</label>
          <textarea
            className="w-full h-48 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Paste raw lecture notes, text, or summaries here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            onClick={generateQuiz}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Generating Quiz...' : 'Generate Quiz & Flashcards'}
          </button>
        </section>
      )}

      {/* STEP 2: DISPLAY QUIZ / FLASHCARDS */}
      {quizData && (
        <section>
          {/* TOP CONTROLS */}
          <div className="flex justify-between items-center mb-6">
            <div className="space-x-2">
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Quiz Mode
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'flashcards' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Flashcards ({quizData.flashcards?.length || 0})
              </button>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('note2quiz_data');
                setQuizData(null);
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Start Over
            </button>
          </div>

          {/* TAB 1: QUIZ MODE */}
          {activeTab === 'quiz' && (
            <div className="bg-white p-6 rounded-xl shadow-md border">
              {score === null ? (
                <div>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
                    <span>{quizData.title}</span>
                  </div>

                  <h2 className="text-xl font-semibold mb-4">
                    {quizData.questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-3 mb-6">
                    {quizData.questions[currentQuestion].options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQuestion, optIdx)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedAnswers[currentQuestion] === optIdx
                            ? 'bg-blue-50 border-blue-500 text-blue-800'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button
                      disabled={currentQuestion === 0}
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-40"
                    >
                      Previous
                    </button>
                    {currentQuestion < quizData.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={calculateScore}
                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg"
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* SCORE SUMMARY */
                <div className="text-center py-6">
                  <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                  <p className="text-4xl font-extrabold text-blue-600 mb-4">
                    {score} / {quizData.questions.length}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Score: {Math.round((score / quizData.questions.length) * 100)}%
                  </p>
                  <button
                    onClick={() => {
                      setScore(null);
                      setSelectedAnswers({});
                      setCurrentQuestion(0);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FLASHCARDS MODE */}
          {activeTab === 'flashcards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizData.flashcards?.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleFlashcard(idx)}
                  className="p-6 border rounded-xl shadow-sm text-center cursor-pointer min-h-[160px] flex items-center justify-center bg-white hover:border-blue-500 transition"
                >
                  <p className="font-medium text-lg">
                    {flippedCards[idx] ? card.back : card.front}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}