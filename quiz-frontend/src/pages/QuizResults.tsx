import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import type { FC } from "react";
import type { QuizResult } from "../api/endpoints";

export const QuizResults: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await quizAPI.getAttemptDetail(Number(id));
        setResult(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load results");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={() => navigate("/quizzes")} className="btn-secondary mb-6">
          ← Back to Quizzes
        </button>
        <div className="card p-8 text-center text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={() => navigate("/quizzes")} className="btn-secondary mb-6">
          ← Back to Quizzes
        </button>
        <div className="card p-8 text-center text-red-600 text-lg">Results not found</div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.max_score) * 100);
  const getGrade = () => {
    if (percentage >= 90) return { grade: "A", bg: "bg-green-500", emoji: "🌟" };
    if (percentage >= 75) return { grade: "B", bg: "bg-blue-500", emoji: "👍" };
    if (percentage >= 60) return { grade: "C", bg: "bg-yellow-500", emoji: "👌" };
    if (percentage >= 40) return { grade: "D", bg: "bg-orange-500", emoji: "💪" };
    return { grade: "F", bg: "bg-red-500", emoji: "📚" };
  };

  const gradeInfo = getGrade();
  const minutesTaken = Math.floor(result.time_taken / 60);
  const secondsTaken = result.time_taken % 60;
  const correctCount = result.answers.filter((a) => a.is_correct).length;
  const accuracy = Math.round((correctCount / result.answers.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/quizzes")} className="btn-secondary mb-8">
        ← Back to Quizzes
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2 text-slate-900">🎉 Quiz Complete!</h1>
        <p className="text-xl text-slate-600">Here's how you performed</p>
      </div>

      {/* Score Display */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Grade Circle */}
          <div className="flex flex-col items-center">
            <div className={`${gradeInfo.bg} rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg`}>
              <span className="text-5xl">{gradeInfo.emoji}</span>
              <p className="text-4xl font-bold text-white mt-2">{gradeInfo.grade}</p>
            </div>
          </div>

          {/* Score Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-slate-600 mb-1">Your Score</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {result.score} / {result.max_score} points
            </h2>
            <p className="text-lg font-semibold">
              {percentage}% - {' '}
              <span className={result.is_passed ? 'text-green-600' : 'text-red-600'}>
                {result.is_passed ? '✅ Passed' : '❌ Not Passed'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Time Taken', value: `${minutesTaken}m ${secondsTaken}s`, icon: '⏱️' },
          { label: 'Total Questions', value: result.answers.length, icon: '❓' },
          { label: 'Correct Answers', value: correctCount, icon: '✅' },
          { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
        ].map((stat, idx) => (
          <div key={idx} className="card p-4 text-center">
            <p className="text-3xl mb-2">{stat.icon}</p>
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Review Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-slate-900">📋 Review Your Answers</h2>
        <div className="space-y-3">
          {result.answers.map((answer, index) => (
            <div key={index} className={`card overflow-hidden ${answer.is_correct ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
              <button
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === index ? null : index)
                }
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-2xl">
                    {answer.is_correct ? '✅' : '❌'}
                  </span>
                  <span className="font-semibold text-slate-900">
                    Question {index + 1}
                  </span>
                </div>
                <span className="text-slate-400">
                  {expandedQuestion === index ? '▼' : '▶'}
                </span>
              </button>

              {expandedQuestion === index && (
                <div className="bg-slate-50 p-6 border-t border-slate-200 space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">Question:</p>
                    <p className="text-slate-900 font-medium">{answer.question.text}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">Your Answer:</p>
                    <div className="space-y-2">
                      {answer.chosen_choices.map((choice) => (
                        <div
                          key={choice.id}
                          className={`p-3 rounded-lg ${
                            choice.is_correct
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          <span className="mr-2">{choice.is_correct ? '✓' : '✗'}</span>
                          {choice.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!answer.is_correct && (
                    <div>
                      <p className="text-sm text-slate-600 font-semibold mb-2">Correct Answer:</p>
                      <div className="p-3 rounded-lg bg-green-100 text-green-800 border border-green-300">
                        ✓ {answer.question.choices.find((c) => c.is_correct)?.text || 'N/A'}
                      </div>
                    </div>
                  )}

                  {answer.question.explanation && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900 font-semibold mb-1">💡 Explanation:</p>
                      <p className="text-blue-800">{answer.question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/quizzes" className="btn-primary px-8 py-3 text-lg">
          🎯 Try Another Quiz
        </Link>
        <Link to="/leaderboard" className="btn-secondary px-8 py-3 text-lg">
          🏆 View Leaderboard
        </Link>
      </div>
    </div>
  );
};
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">
              {Math.round(
                (result.answers.filter((a) => a.is_correct).length /
                  result.answers.length) *
                  100,
              )}
              %
            </span>
          </div>
        </div>
      </div>

      <div className="review-section">
        <h2>Review Answers</h2>
        <div className="answers-list">
          {result.answers.map((answer, index) => (
            <div key={index} className="answer-item">
              <button
                className={`answer-header ${answer.is_correct ? "correct" : "incorrect"}`}
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === index ? null : index)
                }
              >
                <span className="question-num">
                  {answer.is_correct ? "✓" : "✗"} Question {index + 1}
                </span>
                <span className="expand-icon">
                  {expandedQuestion === index ? "▼" : "▶"}
                </span>
              </button>

              {expandedQuestion === index && (
                <div className="answer-detail">
                  <div className="question-text">
                    <strong>Question:</strong>
                    <p>{answer.question.text}</p>
                  </div>

                  <div className="choices-review">
                    <strong>Your Answer:</strong>
                    {answer.chosen_choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`choice-item ${
                          choice.is_correct
                            ? "correct-choice"
                            : "incorrect-choice"
                        }`}
                      >
                        {choice.text}
                      </div>
                    ))}
                  </div>

                  {answer.question.explanation && (
                    <div className="explanation">
                      <strong>Explanation:</strong>
                      <p>{answer.question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="results-action">
        <Link to="/quizzes" className="continue-btn">
          Continue Learning
        </Link>
      </div>
    </div>
  );
};
