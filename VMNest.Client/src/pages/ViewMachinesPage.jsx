import React, { useEffect, useState } from 'react';  
import './ViewMachinesPage.css';  
import axios from 'axios';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faChevronLeft, faChevronRight, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FadeLoader } from "react-spinners";

function ViewMachinesPage() {  
   const [machines, setMachines] = useState([]);  
   const [filteredMachines, setFilteredMachines] = useState([]);  
   const [error, setError] = useState(null);  
   const [currentPage, setCurrentPage] = useState(1);  
   const [totalPages, setTotalPages] = useState(1);  
   const [searchQuery, setSearchQuery] = useState('');  
   const [selectedMachines, setSelectedMachines] = useState([]);  
   const [selectAll, setSelectAll] = useState(false);  
   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
   const [tableLoading, setTableLoading] = useState(false); // New state for table-specific loading

   const pageSize = 10;  

    const fetchMachines = async () => {
        setTableLoading(true); // Show table-specific loading

        try {
            const response = await axios.get(`http://localhost:5063/api/ViewMachines/ips-and-macs`, {
                params: {
                    page: currentPage,
                    pageSize: pageSize,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const fetchedMachines = response.data.items;
            const paddedMachines = Array.from({ length: pageSize }, (_, i) => fetchedMachines[i] || null);
            setMachines(paddedMachines);
            setFilteredMachines(paddedMachines);
            setTotalPages(response.data.totalPages);
        } catch {
            setError('Failed to fetch machines data.');
        } finally {

            setTableLoading(false); // Hide table-specific loading

        }
    };  

    useEffect(() => {  
       fetchMachines();  
   }, [currentPage]);  

   const handleSearch = (e) => {  
       const query = e.target.value.toLowerCase();  
       setSearchQuery(query);  
       const filtered = machines.filter((machine) =>  
           machine && (  
               machine.ip.toLowerCase().includes(query) ||  
               machine.macAddress.toLowerCase().includes(query) ||  
               machine.name.toLowerCase().includes(query)  
           )  
       );  
       setFilteredMachines(filtered);  
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

   const handleActionButtonClick = () => {  
       alert(`Performing action on ${selectedMachines.length} selected machines.`);  
   };  

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedMachines = [...filteredMachines].sort((a, b) => {
            if (!a || !b) return 0; // Handle null or undefined values
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredMachines(sortedMachines);
    };

   if (error) {  
       return <div className="error">{error}</div>;  
   }  

   return (  
       <div className="view-machines-page">  
           <div className="view-machines-top-section">  
               <input  
                   type="text"  
                   placeholder="Search by IP, MAC, or DNS Name"  
                   value={searchQuery}  
                   onChange={handleSearch}  
                   className="view-machines-search-bar"  
               />  
               <button
                   className={`view-machines-delete-button ${selectedMachines.length === 0 ? 'disabled' : ''}`}  
                   onClick={handleActionButtonClick}
                   disabled={selectedMachines.length === 0}
               >
                   <FontAwesomeIcon icon={faTrash} /> Delete
               </button>  
               <button className="view-machines-button" onClick={() => fetchMachines(true)}>
                   <FontAwesomeIcon icon={faSync} /> Refresh
               </button>  
           </div>  
           <div className="view-machines-content">  
               <table className="view-machines-table">  
                   <thead>  
                       <tr>
                           <th>
                               <input
                                   type="checkbox"
                                   checked={selectAll}
                                   onChange={handleSelectAll}
                               />
                           </th>
                           <th>
                               ID
                           </th>
                           <th onClick={() => handleSort('ip')}>
                               IP Address{' '}
                               <FontAwesomeIcon
                                   icon={sortConfig.key === 'ip' && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                                   style={{
                                       color: sortConfig.key === 'ip' ? 'black' : 'gray',
                                   }}
                               />
                           </th>
                           <th onClick={() => handleSort('macAddress')}>
                               MAC Address{' '}
                               <FontAwesomeIcon
                                   icon={sortConfig.key === 'macAddress' && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                                   style={{
                                       color: sortConfig.key === 'macAddress' ? 'black' : 'gray',
                                   }}
                               />
                           </th>
                           <th onClick={() => handleSort('name')}>
                               DNS Name{' '}
                               <FontAwesomeIcon
                                   icon={sortConfig.key === 'name' && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                                   style={{
                                       color: sortConfig.key === 'name' ? 'black' : 'gray',
                                   }}
                               />
                           </th>                       </tr>
                   </thead>  
                   <tbody className="table-body-container">
                       {tableLoading && (
                           <tr className="table-body-overlay">
                               <td colSpan="5">
                                   <FadeLoader color="#007bff" size={40} />
                                   <p>Loading...</p>
                               </td>
                           </tr>
                       )}
                       {Array.from({ length: pageSize }, (_, index) => {
                           const machine = filteredMachines[index];
                           return machine ? (
                               <tr key={index}>
                                   <td>
                                       <input
                                           type="checkbox"
                                           checked={selectedMachines.includes(machine)}
                                           onChange={() => handleCheckboxChange(machine)}
                                       />
                                   </td>
                                   <td>{index + 1 + (currentPage - 1) * pageSize}</td>
                                   <td>{machine.ip}</td>
                                   <td>{machine.macAddress}</td>
                                   <td>{machine.name}</td>
                               </tr>
                           ) : (
                               <tr key={index} className="empty-row">
                                   <td colSpan="5">&nbsp;</td> {/* Render an empty row */}
                               </tr>
                           );
                       })}
                   </tbody>
                </table>  
            </div>
           <div className="pagination">
               <button
                   className="pagination-arrow"
                   onClick={handlePreviousPage}
                   disabled={currentPage === 1}
               >
                   <FontAwesomeIcon icon={faChevronLeft} />
               </button>
               {Array.from({ length: totalPages }, (_, i) => (
                   <button
                       key={i + 1}
                       className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                       onClick={() => handlePageClick(i + 1)}
                   >
                       {i + 1}
                   </button>
               ))}
               <button
                   className="pagination-arrow"
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