import React from "react";
import Header from "../components/customer/Header";
import Footer from "../components/customer/Footer";
import Breadcrumb from "../components/common/breadcrumb";
import "./HeaderFooterLayout.css";

const HeaderFooterLayout = ({ children, breadcrumbItems = [] }) => {
  return (
    <>
      <Header />

      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <div className="breadcrumb-wrapper">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}

      <div className="default-layout">
        <main className="default-main-content">
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
};

export default HeaderFooterLayout;
