import React, { useEffect, useState } from 'react';  
import './ViewMachinesPage.css';  
import axios from 'axios';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
function ViewMachinesPage() {  
   const [machines, setMachines] = useState([]);  
   const [filteredMachines, setFilteredMachines] = useState([]);  
   const [loading, setLoading] = useState(true);  
   const [error, setError] = useState(null);  
   const [currentPage, setCurrentPage] = useState(1);  
   const [totalPages, setTotalPages] = useState(1);  
   const [searchQuery, setSearchQuery] = useState('');  
   const [selectedMachines, setSelectedMachines] = useState([]);  
   const [selectAll, setSelectAll] = useState(false);  
   const pageSize = 10;  

   useEffect(() => {  
       const fetchMachines = async () => {  
           setLoading(true);  
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
           } catch (err) {  
               setError('Failed to fetch machines data.');  
           } finally {  
               setLoading(false);  
           }  
       };  

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

   if (loading) {  
       return <div>Loading...</div>;  
   }  

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
               <button className="view-machines-button">
                   <FontAwesomeIcon icon={faSync} /> Refresh
               </button>  
           </div>  
           <hr className="view-machines-divider" />  
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
                           <th>ID</th>  
                           <th>IP Address</th>  
                           <th>MAC Address</th>  
                           <th>DNS Name</th>  
                       </tr>  
                   </thead>  
                   <tbody>  
                       {filteredMachines.map((machine, index) => (  
                           <tr key={index}>  
                               <td>  
                                   <input  
                                       type="checkbox"  
                                       checked={selectedMachines.includes(machine)}  
                                       onChange={() => handleCheckboxChange(machine)}  
                                   />  
                               </td>  
                               <td>{index + 1 + (currentPage - 1) * pageSize}</td>  
                               <td>{machine ? machine.ip : ''}</td>  
                               <td>{machine ? machine.macAddress : ''}</td>  
                               <td>{machine ? machine.name : ''}</td>  
                           </tr>  
                       ))}  
                   </tbody>  
               </table>  
           </div>  
           <div className="pagination">  
               <button  
                   className="pagination-button"  
                   onClick={handlePreviousPage}  
                   disabled={currentPage === 1}  
               >  
                   Previous  
               </button>  
               <span>Page {currentPage} of {totalPages}</span>  
               <button  
                   className="pagination-button"  
                   onClick={handleNextPage}  
                   disabled={currentPage === totalPages}  
               >  
                   Next  
               </button>  
           </div>  
       </div>  
   );  
}  

export default ViewMachinesPage;