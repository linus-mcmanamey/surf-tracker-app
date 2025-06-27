import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import SurfSpots from './components/SurfSpots';
import Sessions from './components/Sessions';
import WeatherConditions from './components/WeatherConditions';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'spots':
        return <SurfSpots />;
      case 'sessions':
        return <Sessions />;
      case 'weather':
        return <WeatherConditions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Surf Tracker</h1>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>
      <main className="App-main">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

export default App;
