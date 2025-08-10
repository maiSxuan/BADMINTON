import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "./Slider.css"; 
import test_img from '../../assets/images/Slider/test1.png' //import vào đây cho nhanhz
import slide1 from '../../assets/images/Slider/slide1.png'
import slide2 from '../../assets/images/Slider/slide2.png'
import slide3 from '../../assets/images/Slider/slide3.png'
import slide4 from '../../assets/images/Slider/slide4.png'
const ImageSlider = () => {
  const images = [
    test_img, slide1, slide2, slide3, slide4  //chỉnh 5 hình ở đây
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className="image-slider">
      <Slider {...settings}>
        {images.map((img, index) => (
          <div key={index} className="slide-img">
            <img src={img} alt={`slide-${index}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;

