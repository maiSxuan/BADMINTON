import AdminHeader from '../admin/AdminHeader';
import AdminSidebar from '../admin/AdminSidebar';
import { Outlet } from 'react-router-dom'; 
import './AdminLayout.css'; 

const AdminLayout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="admin-layout">

      <AdminHeader user={user}/>

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