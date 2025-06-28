import React, { useState, useEffect } from 'react';
import "./UserList.css"
import  Pagination  from '../../components/common/Pagination';
const UserListPage = () => {
  //lấy data
  const [users, setUsers] = useState([]);
  //set up page
  const [currentPage, setCurrentPage] = useState(1);
  let usersPerPage = 10;
  useEffect(() => {
  const getUserData = async () => {
    try {
      const response = await fetch("http://localhost:4000/admin/user-list"); 
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu người dùng:", err);
    }
  };

  getUserData(); 
}, []);
  //get current posts
  const indexOfLastUser =currentPage * usersPerPage;
  const indexOfFirstUSer = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUSer,indexOfLastUser)
  const paginate = (pageNumbers) => setCurrentPage(pageNumbers)
  return (
    <div className="user-list-page"> 
      <h1>Danh Sách Người Dùng</h1>
      <div className="table-container">
        {users.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Trạng Thái</th>
                <th>Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.filter((user) => !user.isAdmin )
              .map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isLock ? 'Khóa' : 'Bình thường'} </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có người dùng nào để hiển thị.</p>
        )}
      </div>
      <Pagination usersPerPage={usersPerPage} totalUsers={users.length} paginate={paginate} currentPage={currentPage}/>
    </div>
);
};

export default UserListPage;