import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import "../styles/QuizResults.css";
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

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!result) return <div className="error">Results not found</div>;

  const percentage = Math.round((result.score / result.max_score) * 100);
  const getGrade = () => {
    if (percentage >= 90) return { grade: "A", color: "#4caf50" };
    if (percentage >= 75) return { grade: "B", color: "#8bc34a" };
    if (percentage >= 60) return { grade: "C", color: "#ff9800" };
    if (percentage >= 40) return { grade: "D", color: "#ff5722" };
    return { grade: "F", color: "#f44336" };
  };

  const gradeInfo = getGrade();
  const minutesTaken = Math.floor(result.time_taken / 60);
  const secondsTaken = result.time_taken % 60;

  return (
    <div className="results-container">
      <button onClick={() => navigate("/quizzes")} className="back-btn">
        ← Back to Quizzes
      </button>

      <div className="results-header">
        <h1>Quiz Complete!</h1>
        <p>Here's how you performed</p>
      </div>

      <div className="score-display">
        <div className="score-card">
          <div
            className="score-circle"
            style={{ borderColor: gradeInfo.color }}
          >
            <div className="grade" style={{ color: gradeInfo.color }}>
              {gradeInfo.grade}
            </div>
            <div className="percentage">{percentage}%</div>
          </div>

          <div className="score-details">
            <h2>Your Score</h2>
            <p className="score-main">
              {result.score} / {result.max_score} points
            </p>
            <p className="score-status">
              {result.is_passed ? "✓ Passed" : "✗ Not Passed"}
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">
              {minutesTaken}m {secondsTaken}s
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Questions</span>
            <span className="stat-value">{result.answers.length}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Correct</span>
            <span className="stat-value">
              {result.answers.filter((a) => a.is_correct).length}
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
