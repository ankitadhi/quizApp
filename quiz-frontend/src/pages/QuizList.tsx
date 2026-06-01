import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import type { Quiz, Category } from "../api/endpoints";
import type { FC } from "react";

/**
 * QuizList Component
 * Displays a list of available quizzes with filtering capabilities
 * Users can search by title, filter by category and difficulty level
 */
export const QuizList: FC = () => {
  // State management
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quizzes and categories when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories and quizzes in parallel
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

  /**
   * Get difficulty badge styling and icon based on difficulty level
   */
  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      easy: { color: "bg-green-100 text-green-800", icon: "🟢" },
      medium: { color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
      hard: { color: "bg-red-100 text-red-800", icon: "🔴" },
    };
    return badges[difficulty as keyof typeof badges] || badges.medium;
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 text-center max-w-md">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-3 text-slate-900">🎯 Available Quizzes</h1>
        <p className="text-xl text-slate-600">Challenge yourself with our collection of quizzes and expand your knowledge</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">🔍 Search</label>
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">📚 Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">⚡ Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field"
            >
              <option value="">All Difficulties</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const badge = getDifficultyBadge(quiz.difficulty);
            return (
              <div key={quiz.id} className="card p-6 hover:scale-105 transform transition cursor-pointer group">
                {/* Quiz Header with Title and Difficulty */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition flex-1">
                    {quiz.title}
                  </h3>
                  <span className={`badge-primary text-xs font-bold ${badge.color} whitespace-nowrap ml-2`}>
                    {badge.icon} {quiz.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Quiz Description */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                {/* Quiz Meta Information */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {quiz.category.icon} {quiz.category.name}
                    </span>
                    <span className="badge-secondary bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {quiz.question_count} Q
                    </span>
                  </div>

                  {/* Time Limit and Max Score */}
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>⏱️ {Math.floor(quiz.time_limit / 60)}m</span>
                    <span>⭐ {quiz.max_score} pts</span>
                  </div>
                </div>

                {/* Start Quiz Button */}
                <Link to={`/quiz/${quiz.id}`} className="btn-primary w-full text-center block">
                  Start Quiz →
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="card p-12 text-center">
          <p className="text-2xl text-slate-500 mb-2">📭 No quizzes found</p>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};\n        </div>\n      </div>\n\n      {/* Quizzes Grid */}\n      {quizzes.length > 0 ? (\n        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n          {quizzes.map((quiz) => {\n            const badge = getDifficultyBadge(quiz.difficulty);\n            return (\n              <div key={quiz.id} className=\"card p-6 hover:scale-105 transform transition cursor-pointer group\">\n                <div className=\"flex justify-between items-start mb-3\">\n                  <h3 className=\"text-xl font-bold text-slate-900 group-hover:text-blue-600 transition flex-1\">\n                    {quiz.title}\n                  </h3>\n                  <span className={`badge-primary text-xs font-bold ${badge.color} whitespace-nowrap ml-2`}>\n                    {badge.icon} {quiz.difficulty.toUpperCase()}\n                  </span>\n                </div>\n\n                <p className=\"text-slate-600 text-sm mb-4 line-clamp-2\">{quiz.description}</p>\n\n                <div className=\"space-y-3 mb-4\">\n                  <div className=\"flex items-center justify-between text-sm\">\n                    <span className=\"text-slate-600\">\n                      {quiz.category.icon} {quiz.category.name}\n                    </span>\n                    <span className=\"badge-secondary bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs\">\n                      {quiz.question_count} Q\n                    </span>\n                  </div>\n\n                  <div className=\"flex justify-between text-sm text-slate-600\">\n                    <span>⏱️ {Math.floor(quiz.time_limit / 60)}m</span>\n                    <span>⭐ {quiz.max_score} pts</span>\n                  </div>\n                </div>\n\n                <Link to={`/quiz/${quiz.id}`} className=\"btn-primary w-full text-center block\">\n                  Start Quiz →\n                </Link>\n              </div>\n            );\n          })}\n        </div>\n      ) : (\n        <div className=\"card p-12 text-center\">\n          <p className=\"text-2xl text-slate-500 mb-2\">📭 No quizzes found</p>\n          <p className=\"text-slate-400\">Try adjusting your search or filters</p>\n        </div>\n      )}\n    </div>\n  );\n};
