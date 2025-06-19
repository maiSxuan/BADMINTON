// src/pages/customer/Home.js

import React from 'react';
import ImageSlider from '../../components/customer/Slider';
import Header from '../../components/customer/Header';
import Footer from '../../components/customer/Footer';
const Home = () => {
  return (
    <div>
      <Header />
      <ImageSlider />
      <Footer />
    </div>
  );
};

export default Home;