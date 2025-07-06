import AdminHeader from '../admin/AdminHeader';
import AdminSidebar from '../admin/AdminSidebar';
import { Outlet } from 'react-router-dom'; 
import './AdminLayout.css'; 

// const AdminLayout = ({ children }) => {
//   
import Breadcrumb from '../common/breadcrumb';
const AdminLayout = ({ children, breadcrumbItems = [] }) => {
  const user = JSON.parse(localStorage.getItem("user"));
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