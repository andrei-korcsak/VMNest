import React, { useEffect, useState } from 'react';
import './ViewMachinesPage.css';
import axios from 'axios'; // Optional: Use fetch if axios is not installed

function ViewMachinesPage() {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the API when the component loads
        const fetchMachines = async () => {
            try {
                const response = await axios.get('http://localhost:5063/api/ViewMachines/ips-and-macs', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }); 
                setMachines(response.data);
            } catch (err) {
                setError('Failed to fetch machines data.');
            } finally {
                setLoading(false);
            }
        };

        fetchMachines(); // Call the function
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="view-machines-page">
            <div className="view-machines-top-section">
                <button className="view-machines-button">Add Machine</button>
                <button className="view-machines-button">Remove Machine</button>
                <select className="view-machines-filter">
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <hr className="view-machines-divider" />
            <div className="view-machines-content">
                <table className="view-machines-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>IP Address</th>
                            <th>MAC Address</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machines.map((machine, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{machine.ip}</td>
                                <td>{machine.macAddress}</td>
                                <td>{machine.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ViewMachinesPage;