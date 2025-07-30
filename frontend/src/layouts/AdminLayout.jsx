import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import { Outlet } from 'react-router-dom'; 
import './AdminLayout.css'; 
// import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';

import Breadcrumb from '../components/common/breadcrumb';
const AdminLayout = ({ children, breadcrumbItems = [] }) => {
  // const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect nếu không phải admin
  // useEffect(() => {
  //   if (!user || user.role !== 'admin') {
  //     navigate('/'); // hoặc navigate('/not-found') tùy bạn
  //     alert('Trang không được phép truy cập')
  //   }
  // }, [user, navigate]);
  
  return (
    
    <div className="admin-layout">

      <AdminHeader user={user}/>
      {/* Breadcrumb nằm dưới Header */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <div className="breadcrumb-wrapper">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}
      <div className="admin-body-container">
        
        <AdminSidebar />
        
        <main className="admin-main-content">
          {children || <Outlet />} 
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;