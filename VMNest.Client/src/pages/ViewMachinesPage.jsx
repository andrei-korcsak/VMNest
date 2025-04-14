import React, { useEffect, useState } from 'react';  
import './ViewMachinesPage.css';  
import axios from 'axios';  

function ViewMachinesPage() {  
   const [machines, setMachines] = useState([]);  
   const [loading, setLoading] = useState(true);  
   const [error, setError] = useState(null);  
   const [currentPage, setCurrentPage] = useState(1);  
   const [totalPages, setTotalPages] = useState(1);  
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
               setTotalPages(response.data.totalPages);  
           } catch (err) {  
               setError('Failed to fetch machines data.');  
           } finally {  
               setLoading(false);  
           }  
       };  

       fetchMachines();  
   }, [currentPage]);  

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
                               <td>{index + 1 + (currentPage - 1) * pageSize}</td>  
                               <td>{machine ? machine.ip : ''}</td>  
                               <td>{machine ? machine.macAddress : ''}</td>  
                               <td>{machine ? machine.type : ''}</td>  
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