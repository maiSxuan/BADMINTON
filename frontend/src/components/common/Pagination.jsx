import React from 'react'
import "./Pagination.css"
// ceil(totalitems = 9 / itemsPerPage = 10) = 1
// paginate hàm 
const Pagination = ({itemsPerPage, totalItems, paginate, currentPage})=> {
    const pageNumbers = []
    for (let i=1; i<= Math.ceil(totalItems/itemsPerPage); i++){
        pageNumbers.push(i)
    }
    return (
        <div className="pagination">
            <ul className="page-bar">
                {pageNumbers.map((number)=>(
                    <li key={number}>
                        <button onClick={()=>(paginate(number))}className={`page-button ${currentPage === number ? 'active' : ''}`}>
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
};
export default Pagination