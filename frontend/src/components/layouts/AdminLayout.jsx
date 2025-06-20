import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from "../../components/admin/AdminHeader";
import Breadcrumb from '../../components/common/breadcrumb';
function AdminLayout({children}){
    return (
        <div>
            <AdminHeader />
            <div className='containter'>
                <AdminSidebar/>
                <Breadcrumb/>
                <div className='content'>
                    {children}
                </div>
            </div>
        </div>
    )

}
export default AdminLayout