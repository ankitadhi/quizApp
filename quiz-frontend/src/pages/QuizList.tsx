import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import "../styles/QuizList.css";
import type { Quiz, Category } from "../api/endpoints";
import type { FC } from "react";

export const QuizList: FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, quizzesRes] = await Promise.all([
          quizAPI.getCategories(),
          quizAPI.getQuizzes({
            category: selectedCategory || undefined,
            difficulty: difficulty || undefined,
            search: searchTerm || undefined,
          }),
        ]);
        setCategories(categoriesRes.data);
        setQuizzes(quizzesRes.data);
        setError(null);
      } catch (err) {
        setError("Failed to load quizzes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, difficulty, searchTerm]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "easy";
      case "medium": return "medium";
      case "hard": return "hard";
      default: return "";
    }
  };

  if (loading) return <div className="loading">Loading quizzes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-list-page">
      <div className="quiz-header">
        <h1>Available Quizzes</h1>
        <p>Challenge yourself with our collection of quizzes</p>
      </div>

      <div className="quiz-filters">
        <input
          type="text"
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="filter-select"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="quizzes-grid">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-card-header">
                <h3>{quiz.title}</h3>
                <span
                  className={`difficulty-badge ${getDifficultyColor(quiz.difficulty)}`}
                >
                  {quiz.difficulty.charAt(0).toUpperCase() +
                    quiz.difficulty.slice(1)}
                </span>
              </div>

              <p className="quiz-description">{quiz.description}</p>

              <div className="quiz-meta">
                <span className="category-badge">
                  {quiz.category.icon} {quiz.category.name}
                </span>
                <span className="question-count">
                  {quiz.question_count} Questions
                </span>
              </div>

              <div className="quiz-info">
                <div className="info-item">
                  <span className="label">Time Limit:</span>
                  <span className="value">
                    {Math.floor(quiz.time_limit / 60)}m
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Max Score:</span>
                  <span className="value">{quiz.max_score}</span>
                </div>
              </div>

              <Link to={`/quiz/${quiz.id}`} className="start-btn">
                Start Quiz →
              </Link>
            </div>
          ))
        ) : (
          <div className="no-quizzes">No quizzes found</div>
        )}
      </div>
    </div>
  );
};
