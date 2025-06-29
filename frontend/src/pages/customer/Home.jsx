// src/pages/customer/Home.js

import React from 'react';
import ImageSlider from '../../components/customer/Slider';
import Product from '../../pages/customer/HomeProduct';

const Home = () => {
  return (
    <div>
      <ImageSlider />
      <Product />
    </div>
  );
};

export default Home;