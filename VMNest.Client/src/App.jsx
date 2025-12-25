import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import NavigationComponent from './components/navigation/NavigationComponent';
import HeaderComponent from './components/header/HeaderComponent';
import ViewMachinesPage from './pages/ViewMachinesPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import { MachinesProvider } from './contexts/MachinesContext';
import './App.css';

// Path to title mapping
const pathToTitle = {
    '/view-machines': 'View Machines',
    '/dashboard': 'Dashboard',
    '/settings': 'Settings'
};

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('View Machines');
    const [hasCheckedDefaultRoute, setHasCheckedDefaultRoute] = useState(false);

    // Check for default landing page on initial load
    useEffect(() => {
        if (!hasCheckedDefaultRoute && location.pathname === '/') {
            const savedSettings = localStorage.getItem('vmnest-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                const defaultPath = `/${settings.defaultView}`;
                navigate(defaultPath, { replace: true });
            }
            setHasCheckedDefaultRoute(true);
        }
    }, [location.pathname, navigate, hasCheckedDefaultRoute]);

    // Update header title based on current route
    useEffect(() => {
        const title = pathToTitle[location.pathname] || 'View Machines';
        setSelectedOption(title);
    }, [location.pathname]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    return (
        <div className="app">
            <NavigationComponent onOptionSelect={handleOptionSelect} />
            <HeaderComponent title={selectedOption} />

            <div className="main-content">
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/view-machines" element={<ViewMachinesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/" element={<Navigate to="/view-machines" replace />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <MachinesProvider>
                <AppContent />
            </MachinesProvider>
        </Router>
    );
}

export default App;
