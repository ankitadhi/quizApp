import { useEffect, useState } from "react";
import type { FC } from "react";
import { leaderboardAPI } from "../api/endpoints";
import type { LeaderboardEntry } from "../api/endpoints";

/**
 * Leaderboard Component
 * Displays a ranked list of all users based on their total quiz scores
 * Shows medals for top 3 performers and user avatars
 */
export const Leaderboard: FC = () => {
  // State management
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await leaderboardAPI.getLeaderboard({ limit: 100 });
        setLeaderboard(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load leaderboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-3 text-slate-900">
          🏆 Leaderboard
        </h1>
        <p className="text-xl text-slate-600">
          Top performers on QuizMaster - compete and climb to the top!
        </p>
      </div>

      {/* Leaderboard List */}
      {leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.user.id}
              className="card p-4 hover:shadow-xl transition hover:bg-blue-50"
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge with Medal/Number */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-3xl">
                    {entry.rank === 1 && "🥇"}
                    {entry.rank === 2 && "🥈"}
                    {entry.rank === 3 && "🥉"}
                    {entry.rank > 3 && (
                      <span className="text-2xl font-bold text-white">
                        #{entry.rank}
                      </span>
                    )}
                  </span>
                </div>

                {/* User Information */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* User Avatar */}
                    {entry.user.avatar && (
                      <img
                        src={entry.user.avatar}
                        alt={entry.user.username}
                        className="w-10 h-10 rounded-full border-2 border-blue-200"
                      />
                    )}
                    <div>
                      <p className="font-bold text-lg text-slate-900">
                        {entry.user.username}
                      </p>
                      <p className="text-sm text-slate-500">
                        {entry.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score and Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="mb-2">
                    <p className="text-sm text-slate-600">Total Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {entry.total_score}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600">
                    📝 {entry.attempts_count} quizzes
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="card p-12 text-center">
          <p className="text-2xl text-slate-500 mb-2">
            📭 No users on leaderboard yet
          </p>
          <p className="text-slate-400">Be the first to complete a quiz!</p>
        </div>
      )}
    </div>
  );
};
