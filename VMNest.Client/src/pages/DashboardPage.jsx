import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [machinesMetrics, setMachinesMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [statsResponse, metricsResponse] = await Promise.all([
                axios.get(API_ENDPOINTS.dashboard.stats, API_CONFIG),
                axios.get(API_ENDPOINTS.dashboard.machinesMetrics, API_CONFIG)
            ]);

            setStats(statsResponse.data);
            setMachinesMetrics(metricsResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const formatLastUpdated = (lastUpdated) => {
        if (!lastUpdated) return 'Metrics Not Obtained';
        const date = new Date(lastUpdated);
        
        // Format: YYYY-MM-DD HH:MM:SS
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formatBandwidth = (mbps) => {
        if (mbps < 1) {
            return `${(mbps * 1000).toFixed(0)} Kbps`;
        }
        return `${mbps.toFixed(2)} Mbps`;
    };

    const formatBytes = (mb) => {
        if (mb >= 1024) {
            return `${(mb / 1024).toFixed(1)} GB`;
        }
        return `${mb.toFixed(0)} MB`;
    };

    if (loading) {
        return <div className="dashboard-loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Machines</h3>
                    <p className="stat-value">{stats?.totalMachines || 0}</p>
                </div>
                <div className="stat-card running">
                    <h3>Running</h3>
                    <p className="stat-value">{stats?.runningMachines || 0}</p>
                </div>
                <div className="stat-card offline">
                    <h3>Offline</h3>
                    <p className="stat-value">{stats?.offMachines || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Avg CPU Usage</h3>
                    <p className="stat-value">{stats?.averageCpuUsage?.toFixed(1) || 0}%</p>
                </div>
                <div className="stat-card">
                    <h3>Avg Memory Usage</h3>
                    <p className="stat-value">{stats?.averageMemoryUsage?.toFixed(1) || 0}%</p>
                </div>
                <div className="stat-card warning">
                    <h3>High CPU Alerts</h3>
                    <p className="stat-value">{stats?.highCpuMachines || 0}</p>
                </div>
            </div>

            <div className="machines-metrics">
                <h2>Machine Metrics</h2>
                <div className="metrics-grid">
                    {machinesMetrics.map(machine => (
                        <div key={machine.id} className="machine-metric-card">
                            <div className="card-header">
                                <h4 className="machine-name">{machine.name || machine.ip}</h4>
                                <span className="update-time">{formatLastUpdated(machine.lastUpdated)}</span>
                            </div>

                            <div className="card-body">
                                {/* System Resources Section */}
                                <div className="metrics-section">
                                    <h5 className="section-title">System Resources</h5>
                                    
                                    <div className="metric-row">
                                        <span className="metric-label">CPU Usage</span>
                                        <div className="progress-bar" data-percentage={`${machine.cpuUsage.toFixed(1)}%`}>
                                            <div
                                                className="progress-fill cpu"
                                                style={{ width: `${machine.cpuUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="metric-row">
                                        <span className="metric-label">Memory Usage</span>
                                        <div className="progress-bar" data-percentage={`${machine.memoryUsage.toFixed(1)}%`}>
                                            <div
                                                className="progress-fill memory"
                                                style={{ width: `${machine.memoryUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="metric-detail">
                                        <span className="detail-label">Memory:</span>
                                        <span className="detail-value">
                                            {formatBytes(machine.memoryUsedMB)} / {formatBytes(machine.memoryTotalMB)}
                                        </span>
                                    </div>
                                </div>

                                {/* Network Section */}
                                <div className="metrics-section">
                                    <h5 className="section-title">Network</h5>
                                    <div className="metric-detail">
                                        <span className="detail-label">Adapter:</span>
                                        <span className="detail-value">{machine.ethernetAdapter || 'N/A'}</span>
                                    </div>
                                    <div className="network-speeds">
                                        <div className="speed-item download">
                                            <span className="speed-icon">↓</span>
                                            <span className="speed-label">Download</span>
                                            <span className="speed-value">{formatBandwidth(machine.downloadSpeedMbps || 0)}</span>
                                        </div>
                                        <div className="speed-item upload">
                                            <span className="speed-icon">↑</span>
                                            <span className="speed-label">Upload</span>
                                            <span className="speed-value">{formatBandwidth(machine.uploadSpeedMbps || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* System Info Section */}
                                <div className="metrics-section">
                                    <h5 className="section-title">System Info</h5>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Processes</span>
                                            <span className="info-value">{machine.processCount || 0}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Uptime</span>
                                            <span className="info-value">{machine.uptime || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;