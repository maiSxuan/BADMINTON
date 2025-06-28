import React from 'react'
import "./Pagination.css"
// ceil(totalUsers = 9 / usersPerPage = 10) = 1
// paginate hàm 
const Pagination = ({usersPerPage, totalUsers, paginate, currentPage})=> {
    const pageNumbers = []
    for (let i=1; i<= Math.ceil(totalUsers/usersPerPage); i++){
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