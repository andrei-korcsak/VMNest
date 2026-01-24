import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationComponent.css';
import VMNestLogo from '../../images/VMNest_processed.png';
import ViewMachinesIcon from '../../images/view_machines_icon.png';
import DashboardIcon from '../../images/dashboard_icon.png';
import SettingsIcon from '../../images/settings_icon.png';
import SignOutIcon from '../../images/sign_out_icon.png';

function NavigationComponent({ isMenuOpen, onClose }) {
    const navigate = useNavigate();

    const options = [
        { label: 'View Machines', icon: ViewMachinesIcon, path: '/view-machines', disabled: false },
        { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard', disabled: false },
        { label: 'Settings', icon: SettingsIcon, path: '/settings', disabled: false },
        { label: 'Sign Out', icon: SignOutIcon, path: null, disabled: true },
    ];

    const handleNavigation = (option) => {
        if (option.disabled) {
            return;
        }
        
        if (option.path) {
            navigate(option.path);
        }
        
        // Close menu after navigation on mobile
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            {/* Navigation sidebar */}
            <div className={`navigation ${isMenuOpen ? 'open' : ''}`}>
                {/* Close button for mobile */}
                <button className="close-menu" onClick={onClose} aria-label="Close menu">
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
            {isMenuOpen && <div className="menu-overlay" onClick={onClose}></div>}
        </>
    );
}

export default NavigationComponent;