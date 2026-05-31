import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { QuizDetail as QuizDetailType } from "../api/endpoints";
import type { FC } from "react";
import { quizAPI } from "../api/endpoints";

export const QuizDetail: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizAPI.getQuizDetail(Number(id));
        setQuiz(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load quiz");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="btn-outline mb-6">
          ← Back
        </button>
        <div className="card p-8 text-center">
          <p className="text-red-600 text-lg">{error || "Quiz not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6">
        ← Back
      </button>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3 text-slate-900">{quiz.title}</h1>
        <p className="text-lg text-slate-600">{quiz.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {[
          { label: "Difficulty", value: `${quiz.difficulty.charAt(0).toUpperCase()}${quiz.difficulty.slice(1)}`, icon: "⚡" },
          { label: "Category", value: `${quiz.category.icon} ${quiz.category.name}`, icon: "📚" },
          { label: "Questions", value: quiz.question_count, icon: "❓" },
          { label: "Time", value: `${Math.floor(quiz.time_limit / 60)}m`, icon: "⏱️" },
          { label: "Max Score", value: `${quiz.max_score}pts`, icon: "⭐" },
          { label: "Types", value: [...new Set(quiz.questions.map(q => q.type === "mcq" ? "MCQ" : q.type === "true_false" ? "T/F" : "Multi"))].join(", "), icon: "🎯" },
        ].map((stat, idx) => (
          <div key={idx} className="card p-4 text-center\">\n            <p className=\"text-2xl mb-1\">{stat.icon}</p>\n            <p className=\"text-sm text-slate-600 mb-1\">{stat.label}</p>\n            <p className=\"font-bold text-slate-900 text-sm\">{stat.value}</p>\n          </div>\n        ))}\n      </div>\n\n      {/* Questions Preview */}\n      <div className=\"mb-12\">\n        <h2 className=\"text-3xl font-bold mb-6 text-slate-900\">📋 Questions Preview</h2>\n        <div className=\"space-y-3\">\n          {quiz.questions.map((question, index) => (\n            <div key={question.id} className=\"card p-4 hover:bg-blue-50 transition\">\n              <div className=\"flex gap-4\">\n                <div className=\"flex-shrink-0\">\n                  <span className=\"flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm\">\n                    {index + 1}\n                  </span>\n                </div>\n                <div className=\"flex-1\">\n                  <p className=\"font-semibold text-slate-900 mb-2\">{question.text}</p>\n                  <div className=\"flex justify-between items-center\">\n                    <span className=\"badge badge-primary text-xs\">\n                      {question.type === \"mcq\" && \"📝 MCQ\"}\n                      {question.type === \"true_false\" && \"✓ True/False\"}\n                      {question.type === \"multi\" && \"📋 Multi-Select\"}\n                    </span>\n                    <span className=\"text-sm font-semibold text-slate-600\">{question.points} pts</span>\n                  </div>\n                </div>\n              </div>\n            </div>\n          ))}\n        </div>\n      </div>\n\n      {/* CTA Button */}\n      <div className=\"flex justify-center\">\n        <Link to={`/quiz/${quiz.id}/take`} className=\"btn-primary px-8 py-4 text-lg\">\n          🚀 Start Quiz\n        </Link>\n      </div>\n    </div>\n  );\n};
