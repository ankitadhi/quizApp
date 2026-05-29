import { useEffect, useState } from "react";
import type { FC } from "react";
import { leaderboardAPI } from "../api/endpoints";
import type { LeaderboardEntry } from "../api/endpoints";
import "../styles/Leaderboard.css";

export const Leaderboard: FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="loading">Loading leaderboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top performers on QuizMaster</p>
      </div>

      <div className="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th className="rank">Rank</th>
              <th className="user">User</th>
              <th className="score">Total Score</th>
              <th className="attempts">Quizzes Taken</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.user.id} className={`rank-${entry.rank}`}>
                <td className="rank">
                  {entry.rank === 1 && <span className="medal">🥇</span>}
                  {entry.rank === 2 && <span className="medal">🥈</span>}
                  {entry.rank === 3 && <span className="medal">🥉</span>}
                  {entry.rank > 3 && <span>#{entry.rank}</span>}
                </td>
                <td className="user">
                  <div className="user-info">
                    {entry.user.avatar && (
                      <img src={entry.user.avatar} alt={entry.user.username} />
                    )}
                    <div>
                      <p className="username">{entry.user.username}</p>
                      <p className="email">{entry.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="score">
                  <span className="score-value">{entry.total_score}</span>
                </td>
                <td className="attempts">{entry.attempts_count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="no-data">No users on leaderboard yet</div>
        )}
      </div>
    </div>
  );
};
