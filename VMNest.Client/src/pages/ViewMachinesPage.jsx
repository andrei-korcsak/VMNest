import React from 'react';
import './ViewMachinesPage.css';

function ViewMachinesPage() {
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
                            <th>Name</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Machine A</td>
                            <td>Active</td>
                            <td>Type 1</td>
                            <td>2025-04-12</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Machine B</td>
                            <td>Inactive</td>
                            <td>Type 2</td>
                            <td>2025-04-10</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>Machine C</td>
                            <td>Active</td>
                            <td>Type 1</td>
                            <td>2025-04-11</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ViewMachinesPage;