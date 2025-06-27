import React, { useState, useEffect } from 'react';
import { surfSpotService } from '../services/api';

const SurfSpots = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: '',
    latitude: '',
    longitude: '',
    breakType: 'beach',
    skillRequirement: 'beginner',
    description: ''
  });

  useEffect(() => {
    fetchSurfSpots();
  }, []);

  const fetchSurfSpots = async () => {
    try {
      setLoading(true);
      const data = await surfSpotService.getAll();
      setSpots(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching surf spots:', err);
      setError('Failed to load surf spots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newSpotData = {
        ...newSpot,
        latitude: parseFloat(newSpot.latitude),
        longitude: parseFloat(newSpot.longitude)
      };
      
      await surfSpotService.create(newSpotData);
      setNewSpot({ 
        name: '', 
        latitude: '', 
        longitude: '', 
        breakType: 'beach', 
        skillRequirement: 'beginner', 
        description: '' 
      });
      setShowForm(false);
      fetchSurfSpots(); // Refresh the list
    } catch (err) {
      console.error('Error creating surf spot:', err);
      setError('Failed to create surf spot. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setNewSpot({ ...newSpot, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="surf-spots">
        <h2>Surf Spots</h2>
        <div className="loading">Loading surf spots...</div>
      </div>
    );
  }

  return (
    <div className="surf-spots">
      <div className="spots-header">
        <h2>Surf Spots</h2>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Spot'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <form className="spot-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Spot Name"
            value={newSpot.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            step="any"
            name="latitude"
            placeholder="Latitude"
            value={newSpot.latitude}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            step="any"
            name="longitude"
            placeholder="Longitude"
            value={newSpot.longitude}
            onChange={handleInputChange}
            required
          />
          <select name="breakType" value={newSpot.breakType} onChange={handleInputChange}>
            <option value="beach">Beach</option>
            <option value="point">Point</option>
            <option value="reef">Reef</option>
            <option value="river_mouth">River Mouth</option>
            <option value="jetty">Jetty</option>
            <option value="shore">Shore</option>
            <option value="sandbar">Sandbar</option>
          </select>
          <select name="skillRequirement" value={newSpot.skillRequirement} onChange={handleInputChange}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={newSpot.description}
            onChange={handleInputChange}
            rows="3"
          />
          <button type="submit">Add Spot</button>
        </form>
      )}

      <div className="spots-grid">
        {spots.map(spot => (
          <div key={spot.id} className="spot-card">
            <h3>{spot.name}</h3>
            <p className="spot-location">{spot.latitude}, {spot.longitude}</p>
            <div className="spot-details">
              <span className="break-type">{spot.break_type}</span>
              <span className="skill-level">{spot.skill_requirement}</span>
            </div>
            <p className="spot-description">{spot.notes}</p>
            {spot.total_sessions > 0 && (
              <div className="spot-stats">
                <span>Sessions: {spot.total_sessions}</span>
                {spot.average_rating && (
                  <span>Avg Rating: {parseFloat(spot.average_rating).toFixed(1)}/10</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurfSpots;
