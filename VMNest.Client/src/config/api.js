const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5063';

export const API_ENDPOINTS = {
  viewMachines: `${API_BASE_URL}/api/ViewMachines/ips-and-macs`,
  deleteMachines: `${API_BASE_URL}/api/ViewMachines`,
  metrics: (machineId) => `${API_BASE_URL}/api/metrics/${machineId}`,
  metricsLatest: (machineId) => `${API_BASE_URL}/api/metrics/${machineId}/latest`,
  metricsHistory: (machineId, hours = 24) => `${API_BASE_URL}/api/metrics/${machineId}/history?hours=${hours}`,
  dashboard: {
    stats: `${API_BASE_URL}/api/dashboard/stats`,
    machinesMetrics: `${API_BASE_URL}/api/dashboard/machines-metrics`,
  },
};

export const API_CONFIG = {
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_BASE_URL;