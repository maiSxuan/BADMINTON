
import React, { useState } from 'react';
import './AddPromotion.css';

const AddPromotionPage = () => {
  const [step,setStep] = useState(1);
  const [promotionData, setPromotionData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotionData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
    const response = await fetch ('http://localhost:4000/api/promotions',{
        method:"POST",
        headers:{
            "Content-type": "application/json",
        },
        body: JSON.stringify(promotionData)
    });
     if (!response.ok) {
      throw new Error(`Lỗi khi gửi: ${response.status}`);
    }
    }catch (error) {
        console.error("Lỗi",error)
    }

    console.log("Dữ liệu chiến dịch đã gửi:", promotionData);
    alert("Tạo thành công");
  };

  return (
    <div className="add-promotion-container">
      <h1 className="page-title">Tạo Chiến Dịch Khuyến Mãi</h1>

      <form className="promotion-form" onSubmit={handleSubmit}>
        
        <label htmlFor="promo-name" className="form-label">Tên chiến dịch</label>
        <input
          type="text"
          id="promo-name"
          name="name"
          className="form-input"
          value={promotionData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="start-date" className="form-label">Ngày Bắt Đầu</label>
        <input
          type="date"
          id="start-date"
          name="startDate"
          className="form-input"
          value={promotionData.startDate}
          onChange={handleChange}
          required
        />

        <label htmlFor="end-date" className="form-label">Ngày Kết Thúc</label>
        <input
          type="date"
          id="end-date"
          name="endDate"
          className="form-input"
          value={promotionData.endDate}
          onChange={handleChange}
          required
        />

        <label htmlFor="promo-description" className="form-label">Mô tả chiến dịch</label>
        <textarea
          id="promo-description"
          name="description"
          className="form-textarea"
          rows="8"
          value={promotionData.description}
          onChange={handleChange}
          required
        ></textarea>
      
        <div></div> 
        <div className="form-actions">
          <button type="submit" className="submit-btn">Tạo Chiến Dịch</button>
        </div>

      </form>
    </div>
  );
};

export default AddPromotionPage;