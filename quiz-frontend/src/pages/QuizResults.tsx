import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import type { FC } from "react";
import type { QuizResult } from "../api/endpoints";

/**
 * QuizResults Component
 * Displays quiz performance metrics, grades, and detailed answer review
 * Users can review their answers with explanations
 */
export const QuizResults: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Fetch attempt results on component mount
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await quizAPI.getAttemptDetail(Number(id));
        setResult(response.data);
        setError(null);
      } catch (err) {
        setError(
          "Unable to load quiz results. Please try again or contact support.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!id) {
      setError("Invalid quiz ID");
      setLoading(false);
      return;
    }

    fetchResult();
  }, [id]);

  // Memoized grade calculation
  const gradeInfo = useMemo(() => {
    if (!result) return null;
    const percentage = Math.round((result.score / result.max_score) * 100);
    if (percentage >= 90)
      return { grade: "A", bg: "bg-green-500", emoji: "🌟", percentage };
    if (percentage >= 75)
      return { grade: "B", bg: "bg-blue-500", emoji: "👍", percentage };
    if (percentage >= 60)
      return { grade: "C", bg: "bg-yellow-500", emoji: "👌", percentage };
    if (percentage >= 40)
      return { grade: "D", bg: "bg-orange-500", emoji: "💪", percentage };
    return { grade: "F", bg: "bg-red-500", emoji: "📚", percentage };
  }, [result]);

  // Memoized time calculation
  const timeTaken = useMemo(() => {
    if (!result) return { minutes: 0, seconds: 0 };
    return {
      minutes: Math.floor(result.time_taken / 60),
      seconds: result.time_taken % 60,
    };
  }, [result]);

  // Memoized accuracy calculation
  const stats = useMemo(() => {
    if (!result) return { correctCount: 0, accuracy: 0 };
    const correctCount = result.answers.filter((a) => a.is_correct).length;
    const accuracy =
      result.answers.length > 0
        ? Math.round((correctCount / result.answers.length) * 100)
        : 0;
    return { correctCount, accuracy };
  }, [result]);

  // Callback to toggle question expansion
  const handleToggleQuestion = useCallback((index: number) => {
    setExpandedQuestion((prev) => (prev === index ? null : index));
  }, []);

  // Callback to navigate back
  const handleBackClick = useCallback(() => {
    navigate("/quizzes");
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={handleBackClick}
          className="btn-secondary mb-6"
          aria-label="Go back to quizzes"
        >
          ← Back to Quizzes
        </button>
        <div className="card p-8 text-center">
          <p className="text-red-600 text-lg font-semibold" role="alert">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!result || !gradeInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={handleBackClick}
          className="btn-secondary mb-6"
          aria-label="Go back to quizzes"
        >
          ← Back to Quizzes
        </button>
        <div className="card p-8 text-center">
          <p className="text-red-600 text-lg font-semibold" role="alert">
            Results not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <button
        onClick={handleBackClick}
        className="btn-secondary mb-8"
        aria-label="Go back to quizzes"
      >
        ← Back to Quizzes
      </button>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2 text-slate-900">
          🎉 Quiz Complete!
        </h1>
        <p className="text-xl text-slate-600">Here's how you performed</p>
      </div>

      {/* Score Display Card */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Grade Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`${gradeInfo.bg} rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg`}
              role="status"
              aria-label={`Your grade: ${gradeInfo.grade}`}
            >
              <span className="text-5xl">{gradeInfo.emoji}</span>
              <p className="text-4xl font-bold text-white mt-2">
                {gradeInfo.grade}
              </p>
            </div>
          </div>

          {/* Score Information */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-slate-600 mb-1">Your Score</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {result.score} / {result.max_score} points
            </h2>
            <p className="text-lg font-semibold">
              {gradeInfo.percentage}% -{" "}
              <span
                className={
                  result.is_passed
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {result.is_passed ? "✅ Passed" : "❌ Not Passed"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Time Taken",
            value: `${timeTaken.minutes}m ${timeTaken.seconds}s`,
            icon: "⏱️",
          },
          {
            label: "Total Questions",
            value: result.answers.length,
            icon: "❓",
          },
          { label: "Correct Answers", value: stats.correctCount, icon: "✅" },
          { label: "Accuracy", value: `${stats.accuracy}%`, icon: "🎯" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="card p-4 text-center"
            role="region"
            aria-label={`${stat.label}: ${stat.value}`}
          >
            <p className="text-3xl mb-2">{stat.icon}</p>
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Review Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-slate-900">
          📋 Review Your Answers
        </h2>
        <div className="space-y-3">
          {result.answers.map((answer, index) => (
            <div
              key={index}
              className={`card overflow-hidden ${answer.is_correct ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}`}
            >
              {/* Question Header */}
              <button
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => handleToggleQuestion(index)}
                aria-expanded={expandedQuestion === index}
                aria-label={`${answer.is_correct ? "Correct" : "Incorrect"} question ${index + 1}`}
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-2xl" aria-hidden="true">
                    {answer.is_correct ? "✅" : "❌"}
                  </span>
                  <span className="font-semibold text-slate-900">
                    Question {index + 1}
                  </span>
                </div>
                <span className="text-slate-400" aria-hidden="true">
                  {expandedQuestion === index ? "▼" : "▶"}
                </span>
              </button>

              {/* Expanded Content */}
              {expandedQuestion === index && (
                <div className="bg-slate-50 p-6 border-t border-slate-200 space-y-4">
                  {/* Question Text */}
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">
                      Question:
                    </p>
                    <p className="text-slate-900 font-medium">
                      {answer.question.text}
                    </p>
                  </div>

                  {/* User's Answer */}
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">
                      Your Answer:
                    </p>
                    <div className="space-y-2">
                      {answer.chosen_choices.map((choice) => (
                        <div
                          key={choice.id}
                          className={`p-3 rounded-lg ${
                            choice.is_correct
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          <span className="mr-2">
                            {choice.is_correct ? "✓" : "✗"}
                          </span>
                          {choice.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Correct Answer (if wrong) */}
                  {!answer.is_correct && (
                    <div>
                      <p className="text-sm text-slate-600 font-semibold mb-2">
                        Correct Answer:
                      </p>
                      <div className="p-3 rounded-lg bg-green-100 text-green-800 border border-green-300">
                        ✓{" "}
                        {answer.question.choices.find((c) => c.is_correct)
                          ?.text || "N/A"}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {answer.question.explanation && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900 font-semibold mb-1">
                        💡 Explanation:
                      </p>
                      <p className="text-blue-800">
                        {answer.question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          to="/quizzes"
          className="btn-primary px-8 py-3 text-lg"
          aria-label="Go to quizzes to take more quizzes"
        >
          🎯 Try Another Quiz
        </Link>
        <Link
          to="/leaderboard"
          className="btn-secondary px-8 py-3 text-lg"
          aria-label="View global leaderboard"
        >
          🏆 View Leaderboard
        </Link>
      </div>
    </div>
  );
};
