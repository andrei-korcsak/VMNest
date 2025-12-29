import React, { useEffect, useState } from 'react';  
import './ViewMachinesPage.css';  
import { useMachines } from '../contexts/MachinesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faChevronLeft, faChevronRight, faArrowUp, faArrowDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FadeLoader } from "react-spinners";
import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

function ViewMachinesPage() {  
   const { machines: contextMachines, loading: contextLoading, error: contextError, fetchMachines, deleteMachines } = useMachines();
   const [filteredMachines, setFilteredMachines] = useState([]);  
   const [currentPage, setCurrentPage] = useState(1);  
   const [totalPages, setTotalPages] = useState(1);  
   const [searchQuery, setSearchQuery] = useState('');  
   const [selectedMachines, setSelectedMachines] = useState([]);  
   const [selectAll, setSelectAll] = useState(false);  
   const [sortConfig, setSortConfig] = useState({ key: 'status', direction: 'asc' });
   const [tableLoading, setTableLoading] = useState(false);

   const pageSize = 10;  

    useEffect(() => {  
       const loadMachines = async () => {
           setTableLoading(true);
           try {
               await fetchMachines(false);
           } catch (error) {
               console.error('Error loading machines:', error);
           } finally {
               setTableLoading(false);
           }
       };
       
       loadMachines();
   }, [fetchMachines]);

    useEffect(() => {
        if (contextMachines.length > 0) {
            const sortedMachines = [...contextMachines].sort((a, b) => {
                if (!a || !b) return 0;
                if (a.status < b.status) return sortConfig.direction === 'desc' ? -1 : 1;
                if (a.status > b.status) return sortConfig.direction === 'desc' ? 1 : -1;
                return 0;
            });

            setTotalPages(Math.ceil(sortedMachines.length / pageSize));
            
            const startIndex = (currentPage - 1) * pageSize;
            setFilteredMachines(sortedMachines.slice(startIndex, startIndex + pageSize));
        }
    }, [contextMachines, currentPage, sortConfig, pageSize]);

    const handleRefresh = async () => {
        setTableLoading(true);
        try {
            await fetchMachines(true);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error refreshing machines:', error);
        } finally {
            setTableLoading(false);
        }
    };

   const handleSearch = (e) => {  
       const query = e.target.value.toLowerCase();  
       setSearchQuery(query);  
       const filtered = contextMachines.filter((machine) =>  
           machine && (  
               machine.ip.toLowerCase().includes(query) ||  
               machine.macAddress.toLowerCase().includes(query) ||  
               machine.name.toLowerCase().includes(query)  
           )  
       );
       setTotalPages(Math.ceil(filtered.length / pageSize));
       setFilteredMachines(filtered.slice(0, pageSize));
       setCurrentPage(1);
   };  

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

   const handlePreviousPage = () => {  
       if (currentPage > 1) {  
           setCurrentPage(currentPage - 1);  
       }  
   };  

   const handleNextPage = () => {  
       if (currentPage < totalPages) {  
           setCurrentPage(currentPage + 1);  
       }  
   };  

   const handleSelectAll = () => {  
       const newSelectAll = !selectAll;  
       setSelectAll(newSelectAll);  
       if (newSelectAll) {  
           setSelectedMachines(filteredMachines.filter((machine) => machine));  
       } else {  
           setSelectedMachines([]);  
       }  
   };  

   const handleCheckboxChange = (machine) => {  
       if (selectedMachines.includes(machine)) {  
           setSelectedMachines(selectedMachines.filter((m) => m !== machine));  
       } else {  
           setSelectedMachines([...selectedMachines, machine]);  
       }  
   };  

    const handleDelete = async () => {
        if (selectedMachines.length === 0) {
            alert("No machines selected for deletion.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedMachines.length} machine(s)?`)) {
            return;
        }

        const selectedIds = selectedMachines.map((machine) => machine.id);

        try {
            await axios.delete(API_ENDPOINTS.deleteMachines, {
                data: selectedIds,
                ...API_CONFIG
            });

            deleteMachines(selectedIds);
            setSelectedMachines([]);
            setSelectAll(false);

            alert("Selected machines deleted successfully.");
        } catch (error) {
            console.error("Failed to delete machines:", error);
            alert("Failed to delete selected machines. Please try again.");
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedMachines = [...filteredMachines].sort((a, b) => {
            if (!a || !b) return 0;
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredMachines(sortedMachines);
    };

   if (contextError) {  
       return <div className="error-message">{contextError}</div>;  
   }  

   return (  
       <div className="view-machines-container">
           <div className="view-machines-toolbar">  
               <div className="search-container">
                   <FontAwesomeIcon icon={faSearch} className="search-icon" />
                   <input  
                       type="text"  
                       placeholder="Search by IP, MAC, or DNS Name"  
                       value={searchQuery}  
                       onChange={handleSearch}  
                       className="view-machines-search-bar"  
                   />
               </div>
               <div className="toolbar-actions">
                   <button className="toolbar-button refresh-button" onClick={handleRefresh}>
                       <FontAwesomeIcon icon={faSync} /> Refresh
                   </button>
                   <button
                       className={`toolbar-button delete-button ${selectedMachines.length === 0 ? 'disabled' : ''}`}  
                       onClick={handleDelete}
                       disabled={selectedMachines.length === 0}
                   >
                       <FontAwesomeIcon icon={faTrash} /> Delete ({selectedMachines.length})
                   </button>
               </div>
               <div className="machines-summary">
                   <span className="summary-item">
                       <span className="summary-label">Total:</span>
                       <span className="summary-value">{contextMachines.length}</span>
                   </span>
                   <span className="summary-item running">
                       <span className="summary-label">Running:</span>
                       <span className="summary-value">{contextMachines.filter(m => m.status === 'Running').length}</span>
                   </span>
                   <span className="summary-item offline">
                       <span className="summary-label">Offline:</span>
                       <span className="summary-value">{contextMachines.filter(m => m.status === 'Off').length}</span>
                   </span>
               </div>
           </div>

           <div className="machines-table-card">  
               <table className="view-machines-table">  
                   <thead>  
                       <tr>
                           <th className="checkbox-column">
                               <input
                                   type="checkbox"
                                   checked={selectAll}
                                   onChange={handleSelectAll}
                               />
                           </th>
                           <th className="id-column">#</th>
                           <th className="sortable" onClick={() => handleSort('ip')}>
                               IP Address
                               <FontAwesomeIcon
                                   icon={sortConfig.key === 'ip' && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                                   className={`sort-icon ${sortConfig.key === 'ip' ? 'active' : ''}`}
                               />
                           </th>
                           <th className="sortable" onClick={() => handleSort('macAddress')}>
                               MAC Address
                               <FontAwesomeIcon
                                   icon={sortConfig.key === 'macAddress' && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                                   className={`sort-icon ${sortConfig.key === 'macAddress' ? 'active' : ''}`}
                               />
                           </th>
                           <th className="sortable" onClick={() => handleSort('name')}>
                               DNS Name
                               <FontAwesomeIcon
                                   icon={sortConfig.key === 'name' && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                                   className={`sort-icon ${sortConfig.key === 'name' ? 'active' : ''}`}
                               />
                           </th>
                           <th className="sortable status-column" onClick={() => handleSort('status')}>
                               Status
                               <FontAwesomeIcon
                                   icon={sortConfig.key === 'status' && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                                   className={`sort-icon ${sortConfig.key === 'status' ? 'active' : ''}`}
                               />
                           </th>
                       </tr>
                   </thead>  
                   <tbody className="table-body-container">
                       {(tableLoading || contextLoading) && (
                           <tr className="table-body-overlay">
                               <td colSpan="6">
                                   <div className="loading-overlay-content">
                                       <FadeLoader color="#4facfe" size={40} />
                                       <p>Loading machines...</p>
                                   </div>
                               </td>
                           </tr>
                       )}
                       {Array.from({ length: pageSize }, (_, index) => {
                           const machine = filteredMachines[index];
                           return machine ? (
                               <tr key={index} className="data-row">
                                   <td className="checkbox-column">
                                       <input
                                           type="checkbox"
                                           checked={selectedMachines.includes(machine)}
                                           onChange={() => handleCheckboxChange(machine)}
                                       />
                                   </td>
                                   <td className="id-column">{index + 1 + (currentPage - 1) * pageSize}</td>
                                   <td className="ip-cell">{machine.ip}</td>
                                   <td className="mac-cell">{machine.macAddress}</td>
                                   <td className="name-cell">{machine.name || '-'}</td>
                                   <td className="status-cell">
                                       <span className={`status-badge ${machine.status === 'Running' ? 'status-running' : 'status-off'}`}>
                                           <span className="status-dot"></span>
                                           {machine.status}
                                       </span>
                                   </td>
                               </tr>
                           ) : (
                               <tr key={index} className="empty-row">
                                   <td colSpan="6">&nbsp;</td>
                               </tr>
                           );
                       })}
                   </tbody>
                </table>  
            </div>

           <div className="pagination">
               <button
                   className="pagination-button pagination-arrow"
                   onClick={handlePreviousPage}
                   disabled={currentPage === 1}
               >
                   <FontAwesomeIcon icon={faChevronLeft} />
               </button>
               {Array.from({ length: totalPages }, (_, i) => (
                   <button
                       key={i + 1}
                       className={`pagination-button pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                       onClick={() => handlePageClick(i + 1)}
                   >
                       {i + 1}
                   </button>
               ))}
               <button
                   className="pagination-button pagination-arrow"
                   onClick={handleNextPage}
                   disabled={currentPage === totalPages}
               >
                   <FontAwesomeIcon icon={faChevronRight} />
               </button>
           </div>
       </div>  
   );  
}  

export default ViewMachinesPage;