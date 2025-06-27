import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    favoriteSpot: '',
    avgRating: 0,
    recentSessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats({
        totalSessions: data.totalSessions,
        favoriteSpot: data.favoriteSpot,
        avgRating: data.avgRating,
        recentSessions: data.recentSessions
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Surf Dashboard</h2>
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Surf Dashboard</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <div className="stat-value">{stats.totalSessions}</div>
        </div>
        
        <div className="stat-card">
          <h3>Favorite Spot</h3>
          <div className="stat-value">{stats.favoriteSpot}</div>
        </div>
        
        <div className="stat-card">
          <h3>Average Rating</h3>
          <div className="stat-value">
            {stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/10` : 'N/A'}
          </div>
        </div>
      </div>

      <div className="recent-sessions">
        <h3>Recent Sessions</h3>
        {stats.recentSessions.length > 0 ? (
          <div className="session-list">
            {stats.recentSessions.map(session => (
              <div key={session.id} className="session-item">
                <span className="session-spot">{session.spot}</span>
                <span className="session-date">{new Date(session.date).toLocaleDateString()}</span>
                <span className="session-rating">
                  Rating: {session.rating ? `${session.rating}/10` : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sessions">
            <p>No surf sessions yet. Start tracking your sessions!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
