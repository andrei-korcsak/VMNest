import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo, faSync, faHome, faFileAlt, faClock } from '@fortawesome/free-solid-svg-icons';

function SettingsPage() {
    const [settings, setSettings] = useState({
        dashboardRefreshInterval: 30,
        defaultView: 'view-machines',
        itemsPerPage: 10,
        agentPollingInterval: 30
    });

    const [saved, setSaved] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('vmnest-settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('vmnest-settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Reset all settings to defaults?')) {
            localStorage.removeItem('vmnest-settings');
            window.location.reload();
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-toolbar">
                <h2 className="settings-title">Application Settings</h2>
                {saved && <span className="save-indicator">✓ Settings saved successfully</span>}
            </div>

            <div className="settings-grid">
                {/* Auto-refresh Interval */}
                <div className="setting-card">
                    <div className="setting-header">
                        <FontAwesomeIcon icon={faSync} className="setting-icon" />
                        <div className="setting-title-group">
                            <h3 className="setting-label">Auto-refresh Interval</h3>
                            <p className="setting-description">
                                How often the dashboard refreshes automatically
                            </p>
                        </div>
                    </div>
                    <select
                        className="setting-input"
                        value={settings.dashboardRefreshInterval}
                        onChange={(e) => handleChange('dashboardRefreshInterval', Number(e.target.value))}
                    >
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={300}>5 minutes</option>
                        <option value={0}>Disabled</option>
                    </select>
                </div>

                {/* Default Landing Page */}
                <div className="setting-card">
                    <div className="setting-header">
                        <FontAwesomeIcon icon={faHome} className="setting-icon" />
                        <div className="setting-title-group">
                            <h3 className="setting-label">Default Landing Page</h3>
                            <p className="setting-description">
                                Page to show when you open VMNest
                            </p>
                        </div>
                    </div>
                    <select
                        className="setting-input"
                        value={settings.defaultView}
                        onChange={(e) => handleChange('defaultView', e.target.value)}
                    >
                        <option value="view-machines">View Machines</option>
                        <option value="dashboard">Dashboard</option>
                    </select>
                </div>

                {/* Items Per Page */}
                <div className="setting-card">
                    <div className="setting-header">
                        <FontAwesomeIcon icon={faFileAlt} className="setting-icon" />
                        <div className="setting-title-group">
                            <h3 className="setting-label">Items Per Page</h3>
                            <p className="setting-description">
                                Number of machines to show per page in the table
                            </p>
                        </div>
                    </div>
                    <select
                        className="setting-input"
                        value={settings.itemsPerPage}
                        onChange={(e) => handleChange('itemsPerPage', Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                {/* Agent Polling Interval */}
                <div className="setting-card">
                    <div className="setting-header">
                        <FontAwesomeIcon icon={faClock} className="setting-icon" />
                        <div className="setting-title-group">
                            <h3 className="setting-label">Agent Polling Interval</h3>
                            <p className="setting-description">
                                How often agents report metrics from VMs
                            </p>
                        </div>
                    </div>
                    <select
                        className="setting-input"
                        value={settings.agentPollingInterval}
                        onChange={(e) => handleChange('agentPollingInterval', Number(e.target.value))}
                    >
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={300}>5 minutes</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="settings-actions">
                <button className="settings-button save-button" onClick={handleSave}>
                    <FontAwesomeIcon icon={faSave} /> Save Settings
                </button>
                <button className="settings-button reset-button" onClick={handleReset}>
                    <FontAwesomeIcon icon={faUndo} /> Reset to Defaults
                </button>
            </div>
        </div>
    );
}

export default SettingsPage;