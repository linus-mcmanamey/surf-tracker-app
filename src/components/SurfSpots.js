import React, { useState, useEffect } from 'react';

const SurfSpots = () => {
  const [spots, setSpots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: '',
    location: '',
    breakType: 'beach',
    skillRequirement: 'beginner',
    description: ''
  });

  useEffect(() => {
    setSpots([
      {
        id: 1,
        name: 'Malibu Beach',
        location: 'Malibu, CA',
        breakType: 'beach',
        skillRequirement: 'intermediate',
        description: 'Famous right-hand point break'
      },
      {
        id: 2,
        name: 'Venice Beach',
        location: 'Venice, CA',
        breakType: 'beach',
        skillRequirement: 'beginner',
        description: 'Gentle beach break perfect for learning'
      },
      {
        id: 3,
        name: 'Manhattan Beach',
        location: 'Manhattan Beach, CA',
        breakType: 'beach',
        skillRequirement: 'intermediate',
        description: 'Consistent beach break with good waves'
      }
    ]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = spots.length + 1;
    setSpots([...spots, { ...newSpot, id }]);
    setNewSpot({ name: '', location: '', breakType: 'beach', skillRequirement: 'beginner', description: '' });
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    setNewSpot({ ...newSpot, [e.target.name]: e.target.value });
  };

  return (
    <div className="surf-spots">
      <div className="spots-header">
        <h2>Surf Spots</h2>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Spot'}
        </button>
      </div>

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
            type="text"
            name="location"
            placeholder="Location"
            value={newSpot.location}
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
            <p className="spot-location">{spot.location}</p>
            <div className="spot-details">
              <span className="break-type">{spot.breakType}</span>
              <span className="skill-level">{spot.skillRequirement}</span>
            </div>
            <p className="spot-description">{spot.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurfSpots;
