import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'spots', label: 'Surf Spots' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'weather', label: 'Weather' }
  ];

  return (
    <nav className="navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
