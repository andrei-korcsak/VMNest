import React, { createContext, useState, useContext, useCallback } from 'react';
import apiClient from '../services/apiClient';

const MachinesContext = createContext();

export const useMachines = () => {
    const context = useContext(MachinesContext);
    if (!context) {
        throw new Error('useMachines must be used within a MachinesProvider');
    }
    return context;
};

export const MachinesProvider = ({ children }) => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    const fetchMachines = useCallback(async (force = false) => {
        // If data exists and not forcing refresh, skip API call
        if (machines.length > 0 && !force) {
            return machines;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get('/api/ViewMachines/ips-and-macs');
            const fetchedMachines = response.data.items;

            setMachines(fetchedMachines);
            setLastFetched(new Date());
            setLoading(false);
            return fetchedMachines;
        } catch (err) {
            setError('Failed to fetch machines data.');
            setLoading(false);
            throw err;
        }
    }, [machines.length]);

    const updateMachines = useCallback((updatedMachines) => {
        setMachines(updatedMachines);
    }, []);

    const deleteMachines = useCallback((machineIds) => {
        setMachines(prev => prev.filter(machine => !machineIds.includes(machine.id)));
    }, []);

    const value = {
        machines,
        loading,
        error,
        lastFetched,
        fetchMachines,
        updateMachines,
        deleteMachines
    };

    return (
        <MachinesContext.Provider value={value}>
            {children}
        </MachinesContext.Provider>
    );
};