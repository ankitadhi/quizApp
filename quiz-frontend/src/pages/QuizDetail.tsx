import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { QuizDetail as QuizDetailType } from "../api/endpoints";
import "../styles/QuizDetail.css";
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

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!quiz) return <div className="error">Quiz not found</div>;

  return (
    <div className="quiz-detail-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>

      <div className="quiz-detail-header">
        <h1>{quiz.title}</h1>
        <p className="quiz-description">{quiz.description}</p>
      </div>

      <div className="quiz-details-grid">
        <div className="detail-card">
          <h3>Difficulty</h3>
          <p className={`difficulty ${quiz.difficulty}`}>
            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </p>
        </div>

        <div className="detail-card">
          <h3>Category</h3>
          <p>
            {quiz.category.icon} {quiz.category.name}
          </p>
        </div>

        <div className="detail-card">
          <h3>Questions</h3>
          <p>{quiz.question_count}</p>
        </div>

        <div className="detail-card">
          <h3>Time Limit</h3>
          <p>{Math.floor(quiz.time_limit / 60)} minutes</p>
        </div>

        <div className="detail-card">
          <h3>Max Score</h3>
          <p>{quiz.max_score} points</p>
        </div>

        <div className="detail-card">
          <h3>Question Types</h3>
          <p>
            {[
              ...new Set(
                quiz.questions.map((q) => {
                  if (q.type === "mcq") return "MCQ";
                  if (q.type === "true_false") return "True/False";
                  return "Multi-Select";
                }),
              ),
            ].join(", ")}
          </p>
        </div>
      </div>

      <div className="quiz-questions-preview">
        <h2>Questions Preview</h2>
        <div className="questions-list">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="question-preview">
              <span className="question-number">{index + 1}.</span>
              <div className="question-content">
                <p>{question.text}</p>
                <span className="question-type-badge">
                  {question.type === "mcq" && "📝 MCQ"}
                  {question.type === "true_false" && "✓ True/False"}
                  {question.type === "multi" && "📋 Multi-Select"}
                </span>
              </div>
              <span className="question-points">{question.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-action">
        <Link to={`/quiz/${quiz.id}/take`} className="start-button">
          Start Quiz
        </Link>
      </div>
    </div>
  );
};
