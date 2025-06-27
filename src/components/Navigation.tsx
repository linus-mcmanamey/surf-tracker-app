import React from 'react';
import { NavigationProps, TabType } from '../types';

interface Tab {
  id: TabType;
  label: string;
}

function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'spots', label: 'Surf Spots' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'weather', label: 'Weather' }
  ];

  return (
    <nav className="navigation">
      {tabs.map((tab: Tab) => (
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
}

export default Navigation;
