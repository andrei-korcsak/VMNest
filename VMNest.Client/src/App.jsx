import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationComponent from './components/navigation/NavigationComponent';
import HeaderComponent from './components/header/HeaderComponent';
import ViewMachinesPage from './pages/ViewMachinesPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import { MachinesProvider } from './contexts/MachinesContext';
import './App.css';

function App() {
    const [selectedOption, setSelectedOption] = useState('View Machines');

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    return (
        <Router>
            <MachinesProvider>
                <div className="app">
                    <NavigationComponent onOptionSelect={handleOptionSelect} />
                    <HeaderComponent title={selectedOption} />

                    <div className="main-content">
                        <Routes>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/view-machines" element={<ViewMachinesPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/" element={<Navigate to="/view-machines" />} />
                        </Routes>
                    </div>
                </div>
            </MachinesProvider>
        </Router>
    );
}

export default App;
