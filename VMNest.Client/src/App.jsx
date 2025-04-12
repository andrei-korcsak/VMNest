import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationComponent from './components/navigation/NavigationComponent';
import HeaderComponent from './components/header/HeaderComponent';
import ViewMachinesPage from './pages/ViewMachinesPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
    const [selectedOption, setSelectedOption] = useState('Dashboard');

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    return (
        <Router>

            <div className="app">
                <NavigationComponent onOptionSelect={handleOptionSelect} />
                <HeaderComponent title={selectedOption} />

                <div className="main-content">
                    <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/view-machines" element={<ViewMachinesPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
