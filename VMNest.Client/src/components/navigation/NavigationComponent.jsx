import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationComponent.css';
import VMNestLogo from '../../images/VMNest_processed.png';
import ViewMachinesIcon from '../../images/view_machines_icon.png';
import DashboardIcon from '../../images/dashboard_icon.png';
import SettingsIcon from '../../images/settings_icon.png';
import SignOutIcon from '../../images/sign_out_icon.png';

function NavigationComponent({ onOptionSelect }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const options = [
        { label: 'View Machines', icon: ViewMachinesIcon, path: '/view-machines', disabled: false },
        { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard', disabled: false },
        { label: 'Settings', icon: SettingsIcon, path: '/settings', disabled: false },
        { label: 'Sign Out', icon: SignOutIcon, path: null, disabled: true },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleNavigation = (option) => {
        if (option.disabled) {
            return; // Prevent navigation if disabled
        }
        
        if (option.path) {
            navigate(option.path); // Navigate to the specified path
        }
        if (onOptionSelect) {
            onOptionSelect(option.label); // Update the header title
        }
        
        // Close menu after navigation on mobile
        closeMenu();
    };

    return (
        <>
            {/* Hamburger button for mobile */}
            <button
                className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Navigation sidebar */}
            <div className={`navigation ${isMenuOpen ? 'open' : ''}`}>
                {/* Close button for mobile */}
                <button className="close-menu" onClick={closeMenu} aria-label="Close menu">
                    ×
                </button>

                <div className="navigation-top">
                    <div className="navigation-logo">
                        <img src={VMNestLogo} alt="VMNest Logo" className="vmnest-logo" />
                    </div>
                </div>
                <div className="navigation-options">
                    {options.map(option => (
                        <div
                            key={option.label}
                            className={`navigation-option ${option.disabled ? 'disabled' : ''}`}
                            onClick={() => handleNavigation(option)}
                        >
                            <img src={option.icon} alt={`${option.label} Icon`} className="navigation-icon" />
                            {option.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
        </>
    );
}

export default NavigationComponent;