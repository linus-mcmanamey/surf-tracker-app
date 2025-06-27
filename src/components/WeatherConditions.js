import React, { useState, useEffect } from 'react';

const WeatherConditions = () => {
  const [conditions, setConditions] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState('all');

  useEffect(() => {
    setConditions([
      {
        id: 1,
        spotName: 'Malibu Beach',
        waveHeight: 4.5,
        wavePeriod: 12,
        windSpeed: 8,
        windDirection: 'offshore',
        tideHeight: 2.3,
        waterTemp: 68,
        timestamp: '2025-06-27 08:00'
      },
      {
        id: 2,
        spotName: 'Venice Beach',
        waveHeight: 3.2,
        wavePeriod: 10,
        windSpeed: 12,
        windDirection: 'onshore',
        tideHeight: 1.8,
        waterTemp: 66,
        timestamp: '2025-06-27 08:00'
      },
      {
        id: 3,
        spotName: 'Manhattan Beach',
        waveHeight: 3.8,
        wavePeriod: 11,
        windSpeed: 6,
        windDirection: 'cross-shore',
        tideHeight: 2.1,
        waterTemp: 67,
        timestamp: '2025-06-27 08:00'
      }
    ]);
  }, []);

  const filteredConditions = selectedSpot === 'all' 
    ? conditions 
    : conditions.filter(condition => condition.spotName === selectedSpot);

  const getConditionQuality = (condition) => {
    const { waveHeight, windSpeed, windDirection } = condition;
    let score = 0;
    
    if (waveHeight >= 3 && waveHeight <= 6) score += 2;
    if (windSpeed <= 10) score += 2;
    if (windDirection === 'offshore') score += 2;
    else if (windDirection === 'cross-shore') score += 1;
    
    if (score >= 5) return 'excellent';
    if (score >= 3) return 'good';
    if (score >= 1) return 'fair';
    return 'poor';
  };

  return (
    <div className="weather-conditions">
      <div className="conditions-header">
        <h2>Current Conditions</h2>
        <select 
          value={selectedSpot} 
          onChange={(e) => setSelectedSpot(e.target.value)}
          className="spot-filter"
        >
          <option value="all">All Spots</option>
          <option value="Malibu Beach">Malibu Beach</option>
          <option value="Venice Beach">Venice Beach</option>
          <option value="Manhattan Beach">Manhattan Beach</option>
        </select>
      </div>

      <div className="conditions-grid">
        {filteredConditions.map(condition => (
          <div key={condition.id} className="condition-card">
            <div className="condition-header">
              <h3>{condition.spotName}</h3>
              <span className={`quality-badge ${getConditionQuality(condition)}`}>
                {getConditionQuality(condition).toUpperCase()}
              </span>
            </div>
            
            <div className="condition-details">
              <div className="detail-row">
                <span className="label">Wave Height:</span>
                <span className="value">{condition.waveHeight} ft</span>
              </div>
              <div className="detail-row">
                <span className="label">Wave Period:</span>
                <span className="value">{condition.wavePeriod} sec</span>
              </div>
              <div className="detail-row">
                <span className="label">Wind:</span>
                <span className="value">{condition.windSpeed} mph {condition.windDirection}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tide:</span>
                <span className="value">{condition.tideHeight} ft</span>
              </div>
              <div className="detail-row">
                <span className="label">Water Temp:</span>
                <span className="value">{condition.waterTemp}°F</span>
              </div>
            </div>
            
            <div className="condition-timestamp">
              Updated: {condition.timestamp}
            </div>
          </div>
        ))}
      </div>

      <div className="forecast-section">
        <h3>5-Day Forecast</h3>
        <div className="forecast-grid">
          {['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'].map((day, index) => (
            <div key={index} className="forecast-item">
              <div className="forecast-day">{day}</div>
              <div className="forecast-wave">{(3 + Math.random() * 3).toFixed(1)} ft</div>
              <div className="forecast-wind">{Math.floor(5 + Math.random() * 10)} mph</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherConditions;
