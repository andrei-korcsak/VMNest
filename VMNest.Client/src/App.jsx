import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HeaderComponent from './components/header/HeaderComponent';
import NavigationComponent from './components/navigation/NavigationComponent';
import DashboardPage from './pages/DashboardPage';
import ViewMachinesPage from './pages/ViewMachinesPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';
import { MachinesProvider } from './contexts/MachinesContext';
import axios from 'axios';
import API_BASE_URL from './config/api';

// Component to track route changes and notify server
function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    // Send notification when route changes
    const notifyPageChange = async () => {
        await axios.get(`${API_BASE_URL}/api/page-navigation`, {
          headers: {
            'Current-Page': location.pathname
          }
        });
    };

    notifyPageChange();
  }, [location.pathname]);

  return null;
}

// Component to handle dynamic title based on route
function AppContent() {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    // Update title based on current route
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        setPageTitle('Dashboard');
        break;
      case '/view-machines':
        setPageTitle('View Machines');
        break;
      case '/settings':
        setPageTitle('Settings');
        break;
      default:
        setPageTitle('VMNest');
    }
  }, [location.pathname]);

  return (
    <div className="app-container">
      <HeaderComponent title={pageTitle} />
      <div className="main-content">
        <NavigationComponent />
        <div className="page-content">
          <RouteChangeTracker />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/view-machines" element={<ViewMachinesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <MachinesProvider>
      <Router>
        <AppContent />
      </Router>
    </MachinesProvider>
  );
}

export default App;
