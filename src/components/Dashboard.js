import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    favoriteSport: '',
    avgRating: 0,
    recentSessions: []
  });

  useEffect(() => {
    setStats({
      totalSessions: 15,
      favoriteSport: 'Malibu Beach',
      avgRating: 7.8,
      recentSessions: [
        { id: 1, spot: 'Malibu Beach', date: '2025-06-25', rating: 8 },
        { id: 2, spot: 'Venice Beach', date: '2025-06-23', rating: 7 },
        { id: 3, spot: 'Manhattan Beach', date: '2025-06-20', rating: 9 }
      ]
    });
  }, []);

  return (
    <div className="dashboard">
      <h2>Surf Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <div className="stat-value">{stats.totalSessions}</div>
        </div>
        
        <div className="stat-card">
          <h3>Favorite Spot</h3>
          <div className="stat-value">{stats.favoriteSport}</div>
        </div>
        
        <div className="stat-card">
          <h3>Average Rating</h3>
          <div className="stat-value">{stats.avgRating}/10</div>
        </div>
      </div>

      <div className="recent-sessions">
        <h3>Recent Sessions</h3>
        <div className="session-list">
          {stats.recentSessions.map(session => (
            <div key={session.id} className="session-item">
              <span className="session-spot">{session.spot}</span>
              <span className="session-date">{session.date}</span>
              <span className="session-rating">Rating: {session.rating}/10</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
