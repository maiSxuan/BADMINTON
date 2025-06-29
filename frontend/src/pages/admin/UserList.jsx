  import React, { useState, useEffect } from 'react';
  import "./UserList.css"
  import  Pagination  from '../../components/common/Pagination';
  import { Trash, SquarePen,Lock,LockOpen } from 'lucide-react';
  const UserListPage = () => {
    //lấy data
    const [users, setUsers] = useState([]);
    //set up page
    const [currentPage, setCurrentPage] = useState(1);
    let usersPerPage = 10;
    useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/users"); 
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
    const handleDeleteUser = async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

      try {
        const response = await fetch("http://localhost:4000/admin/user-list/" + id, {
          method: "DELETE",
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `Lỗi HTTP: ${response.status}`);
        }
        setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
        alert("Xóa người dùng thành công.");
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    };
  const handleLockUser = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?")) return;
    try {
      const response = await fetch("http://localhost:4000/admin/user-list/" + id, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const result = await response.json();

      // Cập nhật lại danh sách người dùng
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isLock: result.isLock } : user
        )
      );
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };
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
                  <th>Ngày tham gia</th>
                  <th>Trạng Thái</th>
                  <th>Chỉnh sửa</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.filter((user) => !user.isAdmin )
                .map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="center-cell-center">
                        <button onClick={() => handleLockUser(user._id)}>
                          {user.isLock ? <Lock color="red" size="20" /> : <LockOpen color="green" size="20" />}
                        </button>
                    </td>

                    <td className="center-cell-center">
                        <button>
                          <SquarePen color="grey" size="20" />
                        </button>
                        <button onClickCapture={() => handleDeleteUser(user._id)}>
                          <Trash color="red" size="20" />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có người dùng nào để hiển thị.</p>
          )}
        </div>
        <Pagination itemsPerPage={usersPerPage} totalItems={users.length} paginate={paginate} currentPage={currentPage} className="User-pagination"/>
      </div>
  );
  };

  export default UserListPage;