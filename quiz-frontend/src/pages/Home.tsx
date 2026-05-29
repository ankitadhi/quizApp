import type { FC } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import "../styles/Home.css";

export const Home: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to QuizMaster</h1>
          <p>
            Challenge yourself with engaging quizzes and climb the leaderboard
          </p>

          {isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/quizzes" className="btn btn-primary">
                Start Learning →
              </Link>
              <Link to="/leaderboard" className="btn btn-secondary">
                View Leaderboard
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">
                Get Started →
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Why QuizMaster?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Diverse Topics</h3>
            <p>
              Explore quizzes across multiple categories and difficulty levels
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Timed Challenges</h3>
            <p>
              Test your knowledge with time-based quizzes that keep you sharp
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Leaderboard</h3>
            <p>
              Compete with others and earn recognition for your achievements
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Feedback</h3>
            <p>
              Get explanations and track your progress with detailed results
            </p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Join Our Community</h2>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat">
            <div className="stat-number">500+</div>
            <div className="stat-label">Quizzes</div>
          </div>
          <div className="stat">
            <div className="stat-number">10k+</div>
            <div className="stat-label">Questions</div>
          </div>
        </div>
      </div>
    </div>
  );
};
