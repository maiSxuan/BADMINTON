
import { useState } from 'react';
import './AddPromotion.css';
import { createPromotion } from '../../services/index';
import { usePopup } from '../../components/common/popupContext';

const AddPromotionPage = () => {
  // const [step, setStep] = useState(1);
  const [promotionData, setPromotionData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showPopup } = usePopup()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotionData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createPromotion(promotionData);
      // setStep(2);
      // toast.success("Tạo chiến dịch thành công");
      showPopup(
        'Thông báo',
        'Tạo chiến dịch thành công',
        null,
        null,
        4,
        1
      )

      setPromotionData({
        name: '',
        startDate: '',
        endDate: '',
        description: ''
      });

    } catch (err) {
      console.error("Lỗi khi tạo chiến dịch:", err);
      setError(err.message);
      showPopup(
        'Lỗi',
        err.message || 'Tạo chiến dịch thất bại',
        null,
        null,
        4,
        1
      )
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-promotion-container">
      <h1 className="page-title">Tạo Chiến Dịch Khuyến Mãi</h1>

      <form className="promotion-form" onSubmit={handleCreatePromotion}>
        
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
        <input
          id="promo-description"
          name="description"
          className="form-input"
          rows="8"
          value={promotionData.description}
          onChange={handleChange}
          required
        />

        {loading && <p className="promo-form-info">Đang gửi dữ liệu...</p>}
        {error && <p className="promo-form-error">{error}</p>}
      
        <div></div> 
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Tạo Chiến Dịch'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPromotionPage;