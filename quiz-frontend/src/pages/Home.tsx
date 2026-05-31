import type { FC } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const Home: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Welcome to QuizMaster
          </h1>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Challenge yourself with engaging quizzes and climb the leaderboard
            to become a master of knowledge
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/quizzes" className="btn-primary px-8 py-3 text-lg">
                🚀 Start Learning
              </Link>
              <Link to="/leaderboard" className="btn-outline px-8 py-3 text-lg">
                🏆 View Leaderboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary px-8 py-3 text-lg">
                🎯 Get Started
              </Link>
              <Link to="/login" className="btn-outline px-8 py-3 text-lg">
                📝 Log In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">
            Why QuizMaster?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "📚",
                title: "Diverse Topics",
                desc: "Explore quizzes across multiple categories and difficulty levels",
              },
              {
                icon: "⏱️",
                title: "Timed Challenges",
                desc: "Test your knowledge with time-based quizzes that keep you sharp",
              },
              {
                icon: "🏆",
                title: "Leaderboard",
                desc: "Compete with others and earn recognition for your achievements",
              },
              {
                icon: "📊",
                title: "Detailed Feedback",
                desc: "Get explanations and track your progress with detailed results",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card p-8 text-center hover:scale-105 transform transition"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">
            Join Our Growing Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "1000+", label: "Active Users" },
              { number: "500+", label: "Quizzes" },
              { number: "10k+", label: "Questions" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-xl text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
