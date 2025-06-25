import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/customer/Home';
import Intro from '../pages/customer/Intro'; // Trang Giới Thiệu cho Customer


const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="home" element={<Home />} />
      <Route path="about" element={<Intro />} />
      {/* Các route khác của customer */}
    </Routes>
  );
}

export default CustomerRoutes;