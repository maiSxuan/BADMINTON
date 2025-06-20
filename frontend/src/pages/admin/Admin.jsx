

import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from "../../components/admin/AdminHeader";
import Breadcrumb from '../../components/common/breadcrumb';
const Admin = () => {
  return (
    <div>
      <AdminHeader />
      
      <AdminSidebar/>
      <Breadcrumb />
    </div>
  );
};

export default Admin;
