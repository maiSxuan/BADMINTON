
// import Header from "../customer/Header";
// import Footer from "../customer/Footer";
// import { Sidebar } from "../customer/Sidebar";
// import "./DefaultLayout.css";

// function DefaultLayout({children}){
//     return (
//         <div>
//             <Header />
//             <div className='containter'>
//                 <div className='content'>
//                     {children}
//                 </div>
//             </div>
//             <Footer />
//         </div>
//     )

// }
// export default DefaultLayout
import React from "react";
import Header from "../components/customer/Header";
import Footer from "../components/customer/Footer";
import { Sidebar } from "../components/customer/Sidebar";
import Breadcrumb from "../components/common/breadcrumb";
import "./DefaultLayout.css";

const DefaultLayout = ({ children, showSidebar = false, breadcrumbItems = [] }) => {
  return (
    <>
      <Header />

      {/* Breadcrumb nằm dưới Header */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <div className="breadcrumb-wrapper">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}

      <div className="default-layout">
        {showSidebar && (
          <aside className="default-sidebar">
            <Sidebar />
          </aside>
        )}

        <main
          className={
            showSidebar
              ? "default-main-content with-sidebar"
              : "default-main-content"
          }
        >
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
};

export default DefaultLayout;