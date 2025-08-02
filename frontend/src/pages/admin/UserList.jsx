  import React, { useState, useEffect } from 'react';
  import "./UserList.css"
  import  Pagination  from '../../components/common/Pagination';
  import { Trash, SquarePen,Lock,LockOpen } from 'lucide-react';
  import { getAllUsers, deleteUser, toggleUserStatus } from '../../services';
  import { useNavigate } from "react-router-dom";

  const UserListPage = () => {
    const navigate = useNavigate();
    //lấy data
    const [users, setUsers] = useState([]);
    //set up page
    const [currentPage, setCurrentPage] = useState(1);
    let usersPerPage = 10;

    useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

    // Chưa đăng nhập hoặc không phải admin -> redirect
    if (!token || !user || user.user_type !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang này.");
      navigate("/login");
      return;
    }

    const getUserData = async () => {
      try {
        const data = await getAllUsers(token);
        setUsers(data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", err);
        alert("Không thể tải danh sách người dùng.");
        navigate("/");
      }
    };

    getUserData();
  }, [navigate]);
    //get current posts
    const indexOfLastUser =currentPage * usersPerPage;
    const indexOfFirstUSer = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUSer,indexOfLastUser)
    const paginate = (pageNumbers) => setCurrentPage(pageNumbers)

    const handleDeleteUser = async (id) => {
      const confirm = window.confirm("Bạn có chắc chắn muốn xóa người dùng này?");
      if (!confirm) return;

      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        await deleteUser(id, token);
        setUsers(prev => prev.filter(user => user._id !== id));
        alert("Xóa người dùng thành công");
      } catch (err) {
        alert("Lỗi khi xóa người dùng: " + err.message);
      }
    };

  const handleLockUser = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await toggleUserStatus(id, token);
      setUsers(prev =>
        prev.map(user =>
          user._id === id ? { ...user, status: res.status } : user
        )
      );
      alert("Cập nhật trạng thái thành công");
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + err.message);
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
                {currentUsers.filter((user) => user.user_type !== 'ADMIN' )
                .map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {new Date(user.create_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="center-cell-center">
                        {user.status === 0 ? (
                          <Lock color="red" size="20" />
                        ) : (
                          <LockOpen color="green" size="20" />
                        )}
                    </td>

                    <td className="center-cell-center">
                        <button onClick={() => handleLockUser(user._id)}>
                          <SquarePen color="grey" size="20" />
                        </button>
                        <button onClick={() => handleDeleteUser(user._id)}>
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