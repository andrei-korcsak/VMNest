import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationComponent.css';
import VMNestLogo from '../../images/VMNest_processed.png';
import ViewMachinesIcon from '../../images/view_machines_icon.png';
import DashboardIcon from '../../images/dashboard_icon.png';
import SettingsIcon from '../../images/settings_icon.png';
import SignOutIcon from '../../images/sign_out_icon.png';

function NavigationComponent({ onOptionSelect }) {
    const navigate = useNavigate();

    const options = [
        { label: 'View Machines', icon: ViewMachinesIcon, path: '/view-machines' },
        { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
        { label: 'Settings', icon: SettingsIcon, path: '/settings' },
        { label: 'Sign Out', icon: SignOutIcon, path: null },
    ];

    const handleNavigation = (option) => {
        if (option.path) {
            navigate(option.path); // Navigate to the specified path
        }
        if (onOptionSelect) {
            onOptionSelect(option.label); // Update the header title
        }
    };

    return (
        <div className="navigation">
            <div className="navigation-top">
                <div className="navigation-logo">
                    <img src={VMNestLogo} alt="VMNest Logo" className="vmnest-logo" />
                </div>
            </div>
            <div className="navigation-options">
                {options.map(option => (
                    <div
                        key={option.label}
                        className="navigation-option"
                        onClick={() => handleNavigation(option)}
                    >
                        <img src={option.icon} alt={`${option.label} Icon`} className="navigation-icon" />
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NavigationComponent;