import React, { useState, useEffect } from 'react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({
    surfSpot: '',
    date: '',
    duration: '',
    waveCount: '',
    rating: '',
    conditionsRating: '',
    notes: ''
  });

  useEffect(() => {
    setSessions([
      {
        id: 1,
        surfSpot: 'Malibu Beach',
        date: '2025-06-25',
        duration: 120,
        waveCount: 15,
        rating: 8,
        conditionsRating: 7,
        notes: 'Great session with clean waves'
      },
      {
        id: 2,
        surfSpot: 'Venice Beach',
        date: '2025-06-23',
        duration: 90,
        waveCount: 12,
        rating: 7,
        conditionsRating: 6,
        notes: 'A bit crowded but fun waves'
      },
      {
        id: 3,
        surfSpot: 'Manhattan Beach',
        date: '2025-06-20',
        duration: 150,
        waveCount: 20,
        rating: 9,
        conditionsRating: 9,
        notes: 'Perfect conditions, best session this month'
      }
    ]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = sessions.length + 1;
    setSessions([...sessions, { ...newSession, id }]);
    setNewSession({
      surfSpot: '',
      date: '',
      duration: '',
      waveCount: '',
      rating: '',
      conditionsRating: '',
      notes: ''
    });
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    setNewSession({ ...newSession, [e.target.name]: e.target.value });
  };

  return (
    <div className="sessions">
      <div className="sessions-header">
        <h2>Surf Sessions</h2>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Log Session'}
        </button>
      </div>

      {showForm && (
        <form className="session-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="surfSpot"
            placeholder="Surf Spot"
            value={newSession.surfSpot}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="date"
            value={newSession.date}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (minutes)"
            value={newSession.duration}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="waveCount"
            placeholder="Wave Count"
            value={newSession.waveCount}
            onChange={handleInputChange}
            required
          />
          <select name="rating" value={newSession.rating} onChange={handleInputChange} required>
            <option value="">Session Rating</option>
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <option key={num} value={num}>{num}/10</option>
            ))}
          </select>
          <select name="conditionsRating" value={newSession.conditionsRating} onChange={handleInputChange} required>
            <option value="">Conditions Rating</option>
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <option key={num} value={num}>{num}/10</option>
            ))}
          </select>
          <textarea
            name="notes"
            placeholder="Session Notes"
            value={newSession.notes}
            onChange={handleInputChange}
            rows="3"
          />
          <button type="submit">Log Session</button>
        </form>
      )}

      <div className="sessions-list">
        {sessions.map(session => (
          <div key={session.id} className="session-card">
            <div className="session-header">
              <h3>{session.surfSpot}</h3>
              <span className="session-date">{session.date}</span>
            </div>
            <div className="session-stats">
              <div className="stat">
                <label>Duration:</label>
                <span>{session.duration} min</span>
              </div>
              <div className="stat">
                <label>Waves:</label>
                <span>{session.waveCount}</span>
              </div>
              <div className="stat">
                <label>Session:</label>
                <span>{session.rating}/10</span>
              </div>
              <div className="stat">
                <label>Conditions:</label>
                <span>{session.conditionsRating}/10</span>
              </div>
            </div>
            {session.notes && (
              <div className="session-notes">
                <p>{session.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sessions;
