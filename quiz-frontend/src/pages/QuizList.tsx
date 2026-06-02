import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import type { Quiz, Category } from "../api/endpoints";
import type { FC } from "react";

/**
 * QuizList Component
 * Displays a list of available quizzes with filtering capabilities
 * Users can search by title, filter by category and difficulty level
 * Features: Search debouncing, memoized filtering, accessibility compliance
 */
export const QuizList: FC = () => {
  // State management - Primary filters
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref for search input
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search term - wait 500ms after user stops typing before fetching
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 500);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

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
            search: debouncedSearchTerm || undefined,
          }),
        ]);
        setCategories(categoriesRes.data);
        setQuizzes(quizzesRes.data);
        setError(null);
      } catch (err) {
        setError("Failed to load quizzes. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, difficulty, debouncedSearchTerm]);

  /**
   * Get difficulty badge styling and icon based on difficulty level
   * Memoized to prevent recalculation on every render
   */
  const getDifficultyBadge = useCallback((diffLevel: string) => {
    const badges = {
      easy: { color: "bg-green-100 text-green-800", icon: "🟢" },
      medium: { color: "bg-yellow-100 text-yellow-800", icon: "🟡" },
      hard: { color: "bg-red-100 text-red-800", icon: "🔴" },
    };
    return badges[diffLevel as keyof typeof badges] || badges.medium;
  }, []);

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
          <p className="text-red-600 text-lg font-semibold" role="alert">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-3 text-slate-900">
          🎯 Available Quizzes
        </h1>
        <p className="text-xl text-slate-600">
          Challenge yourself with our collection of quizzes and expand your
          knowledge
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-12" role="search">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter - with debouncing */}
          <div>
            <label
              htmlFor="search-input"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              🔍 Search
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-field"
              aria-label="Search quizzes by title"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label
              htmlFor="category-select"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              📚 Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
              aria-label="Filter quizzes by category"
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
            <label
              htmlFor="difficulty-select"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              ⚡ Difficulty
            </label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field"
              aria-label="Filter quizzes by difficulty level"
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
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="region"
          aria-label="Available quizzes"
        >
          {quizzes.map((quiz) => {
            const badge = getDifficultyBadge(quiz.difficulty);
            return (
              <div
                key={quiz.id}
                className="card p-6 hover:scale-105 transform transition cursor-pointer group"
                role="region"
                aria-label={`${quiz.title} quiz`}
              >
                {/* Quiz Header with Title and Difficulty */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition flex-1">
                    {quiz.title}
                  </h3>
                  <span
                    className={`badge-primary text-xs font-bold ${badge.color} whitespace-nowrap ml-2`}
                    aria-label={`Difficulty: ${quiz.difficulty}`}
                  >
                    {badge.icon} {quiz.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Quiz Description */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {quiz.description}
                </p>

                {/* Quiz Meta Information */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600" title={quiz.category.name}>
                      {quiz.category.icon} {quiz.category.name}
                    </span>
                    <span
                      className="badge-secondary bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      aria-label={`${quiz.question_count} questions`}
                    >
                      {quiz.question_count} Q
                    </span>
                  </div>

                  {/* Time Limit and Max Score */}
                  <div className="flex justify-between text-sm text-slate-600">
                    <span
                      aria-label={`Time limit: ${Math.floor(quiz.time_limit / 60)} minutes`}
                    >
                      ⏱️ {Math.floor(quiz.time_limit / 60)}m
                    </span>
                    <span
                      aria-label={`Maximum score: ${quiz.max_score} points`}
                    >
                      ⭐ {quiz.max_score} pts
                    </span>
                  </div>
                </div>

                {/* Start Quiz Button */}
                <Link
                  to={`/quiz/${quiz.id}`}
                  className="btn-primary w-full text-center block"
                  aria-label={`Start ${quiz.title} quiz`}
                >
                  Start Quiz →
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="card p-12 text-center" role="status">
          <p className="text-2xl text-slate-500 mb-2">📭 No quizzes found</p>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
