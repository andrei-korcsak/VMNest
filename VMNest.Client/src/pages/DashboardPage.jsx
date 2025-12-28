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
        if (!lastUpdated) return 'Never';
        const date = new Date(lastUpdated);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        
        if (diffSecs < 60) return `${diffSecs}s ago`;
        const diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleString();
    };

    const formatBandwidth = (mbps) => {
        if (mbps < 1) {
            return `${(mbps * 1000).toFixed(0)} Kbps`;
        }
        return `${mbps.toFixed(2)} Mbps`;
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
                            <h4>{machine.name || machine.ip}</h4>
                            <div className="metric-row">
                                <span>CPU Usage:</span>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill cpu"
                                        style={{ width: `${machine.cpuUsage}%` }}
                                    >
                                        {machine.cpuUsage.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            <div className="metric-row">
                                <span>Memory Usage:</span>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill memory"
                                        style={{ width: `${machine.memoryUsage}%` }}
                                    >
                                        {machine.memoryUsage.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            <div className="metric-info">
                                <p>Memory: {machine.memoryUsedMB?.toFixed(0)} MB / {machine.memoryTotalMB?.toFixed(0)} MB</p>
                                <p>Processes: {machine.processCount}</p>
                                <p>Uptime: {machine.uptime}</p>
                                <p>Adapter: {machine.ethernetAdapter}</p>
                                <p className="network-speed">
                                    <span className="download">↓ {formatBandwidth(machine.downloadSpeedMbps || 0)}</span>
                                    {' '}
                                    <span className="upload">↑ {formatBandwidth(machine.uploadSpeedMbps || 0)}</span>
                                </p>
                                <p className="last-updated">Last Updated: {formatLastUpdated(machine.lastUpdated)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;