import type { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import "../styles/Navbar.css";

export const Navbar: FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎯 QuizMaster
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/quizzes" className="nav-link">
                Quizzes
              </Link>
              <Link to="/leaderboard" className="nav-link">
                Leaderboard
              </Link>
              <div className="nav-user">
                <span className="user-score">
                  Score: {user?.total_score || 0}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link signup-link">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
