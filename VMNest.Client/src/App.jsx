import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HeaderComponent from './components/header/HeaderComponent';
import NavigationComponent from './components/navigation/NavigationComponent';
import DashboardPage from './pages/DashboardPage';
import ViewMachinesPage from './pages/ViewMachinesPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';
import { MachinesProvider } from './contexts/MachinesContext';
import axios from 'axios';
import API_BASE_URL from './config/api'; // Import API base URL

// Component to track route changes and notify server
function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    // Send notification when route changes
    const notifyPageChange = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/page-navigation`, {
          headers: {
            'Current-Page': location.pathname
          }
        });
        console.log('Page navigation notification sent:', location.pathname);
      } catch (error) {
        console.error('Page navigation notification failed:', error);
      }
    };

    notifyPageChange();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <MachinesProvider>
      <Router>
        <div className="app-container">
          <HeaderComponent />
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
      </Router>
    </MachinesProvider>
  );
}

export default App;
