import type { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const Navbar: FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform"
          >
            🎯 QuizMaster
          </Link>

          <div className="flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/quizzes"
                  className="text-slate-700 font-semibold hover:text-blue-600 transition-colors"
                >
                  Quizzes
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-slate-700 font-semibold hover:text-blue-600 transition-colors"
                >
                  🏆 Leaderboard
                </Link>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200 font-semibold text-slate-800">
                    ⭐ {user?.total_score || 0}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-primary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 font-semibold hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
