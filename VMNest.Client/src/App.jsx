import React, { useState } from 'react';
import NavigationComponent from './components/navigation/NavigationComponent';
import HeaderComponent from './components/header/HeaderComponent';
import './App.css';

function App() {
    const [selectedOption, setSelectedOption] = useState('Dashboard');

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    return (
        <div className="app">
            <NavigationComponent onOptionSelect={handleOptionSelect} />
            <div className="main-content">
                <HeaderComponent title={selectedOption} />
            </div>
        </div>
    );
}

export default App;
