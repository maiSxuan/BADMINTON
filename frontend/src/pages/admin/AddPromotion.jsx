
import React, { useState } from 'react';
import './AddPromotion.css';
import { createPromotion, fetchAllPromotions, updatePromotion } from '../../services/index';

const AddPromotionPage = () => {
  const [step, setStep] = useState(1);
  const [promotionData, setPromotionData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [allPromotions, setAllPromotions] = useState([]);
  const [singlePromotion, setSinglePromotion] = useState(null);

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
    setSuccess(false);
    setLoading(true);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

    try {
      // const response = await fetch('http://localhost:4000/api/promotions', {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify(promotionData)
      // });

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result.message || 'Tạo chiến dịch thất bại.');
      // }
      const result = await createPromotion(token, promotionData);

      console.log("Dữ liệu chiến dịch đã gửi:", result);
      setSuccess(true);
      setStep(2);
      alert("Tạo chiến dịch thành công!");

      setPromotionData({
        name: '',
        startDate: '',
        endDate: '',
        description: ''
      });

    } catch (error) {
      console.error("Lỗi khi tạo chiến dịch:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePromotion = async ( promotionId, updatedData ) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    try {
      // const response = await fetch(`http://localhost:4000/api/promotions/${promotionId}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updatedData)
      // });

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result.message || 'Cập nhật chiến dịch thất bại.');
      // }
      const result = await updatePromotion(token, promotionId, updatedData);

      console.log("Chiến dịch đã được cập nhật:", result.promotion);
      setSuccess(true);
      alert("Cập nhật chiến dịch thành công");

      // Nếu cần reset lại form sau khi update
      // setPromotionData({
      //   name: '',
      //   startDate: '',
      //   endDate: '',
      //   description: ''
      // });

    } catch (error) {
      console.error("Lỗi khi cập nhật chiến dịch:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePromotion = async (promotionId) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    try {
      // const response = await fetch(`http://localhost:4000/api/promotions/${promotionId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   }
      // });

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result.message || 'Xoá chiến dịch thất bại.');
      // }
      const result = await deletePromotion(token, promotionId);

      console.log('Đã xoá chiến dịch:', result.message);
      setSuccess(true);
      alert('Xoá chiến dịch thành công!');
      
    } catch (error) {
      console.error('Lỗi khi xoá chiến dịch:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPromotions = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // if (!token) throw new Error('Chưa đăng nhập');

    try {
      // const res = await fetch('http://localhost:4000/api/promotions', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   }
      // });

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || 'Lỗi khi lấy danh sách chiến dịch');

      // return data.promotions; 
      const list = await fetchAllPromotions(token);
      // setPromotion(list);

    } catch (err) {
      console.error('Lỗi khi load promotions:', err);
      setError(err.message)
    }
  };

  const loadPromotionDetail = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // if (!token) throw new Error('Chưa đăng nhập');

    try {
      // const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   }
      // });

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || 'Lỗi khi lấy chi tiết chiến dịch');

      // return data.promotion; // object
      const promotion = await fetchPromotionById(promotionId, token);
      setPromotionData(promotion);
    } catch (err) {
      console.error('Lỗi load chi tiết:', err.message);
      setError(err.message);
    }
  };

  // useEffect(() => {
  //   const loadPromotions = async () => {
  //     try {
  //       const all = await fetchAllPromotions();
  //       setAllPromotions(all);
  //     } catch (err) {
  //       setError(err.message);
  //     }
  //   };

  //   loadPromotions();
  // }, []);

  // useEffect(() => {
  //   if (!promotionId) return;
  //   const loadDetail = async () => {
  //     try {
  //       const promo = await fetchPromotionById(promotionId);
  //       setSinglePromotion(promo);
  //     } catch (err) {
  //       setError(err.message);
  //     }
  //   };

  //   loadDetail();
  // }, [promotionId]);

  const handleAddCodes = async (promotionId, codes) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // if (!token) throw new Error('Chưa đăng nhập');

    // if (!Array.isArray(codes) || codes.length === 0)
    //   throw new Error('Danh sách mã giảm giá không hợp lệ');

    try {
      // const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/add-codes`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ codes })
      // });

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || 'Lỗi khi thêm mã giảm giá');

      // return data.updatedPromotion;
      const updated = await addCodesToPromotion(promotionId, newCodesArray, token);
      // setPromotion(updated);
      toast.success('Đã thêm mã giảm giá thành công');
    } catch (err) {
      console.error('Lỗi addCodesToPromotion:', err);
      toast.error(`${err.message}`);
    }
  };

  const handleRemoveCodes = async (promotionId, codes) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // if (!token) throw new Error('Chưa đăng nhập');

    // if (!Array.isArray(codes) || codes.length === 0)
    //   throw new Error('Danh sách mã cần xoá không hợp lệ');

    try {
      // const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/remove-codes`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ codes })
      // });

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || 'Lỗi khi xoá mã');

      // return data.updatedCodes;
      const updated = await removeCodesFromPromotion(promotionId, selectedCodes, token);
      setPromotionCodes(updated);
      toast.success('Đã xoá mã giảm giá thành công');
    } catch (err) {
      console.error('Lỗi removeCodesFromPromotion:', err);
      toast.error(`${err.message}`);
    }
  };

  const handleAddProduct = async (promotionId, productDiscounts) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // if (!token) throw new Error('Chưa đăng nhập');

    // if (!Array.isArray(productDiscounts) || productDiscounts.length === 0) {
    //   throw new Error('Danh sách sản phẩm cần áp mã không hợp lệ');
    // }

    try {
      // const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/add-products`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ productDiscounts })
      // });

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || 'Lỗi khi thêm sản phẩm vào khuyến mãi');

      // return data;
      const updatedPromotion = await addProductsToPromotion(promotionId, selectedProductDiscounts, token);
      // setPromotion(updatedPromotion);
      toast.success('Đã thêm sản phẩm vào chiến dịch');
    } catch (err) {
      console.error('Lỗi addProductToPromotion:', err);
      toast.error(`${err.message}`);
    }
  };

  const handleRemoveProduct = async (promotionId, productId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // if (!token) throw new Error('Chưa đăng nhập');

    // if (!promotionId || !productId) throw new Error('Thiếu thông tin promotionId hoặc productId');

    try {
      // const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/products/remove`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ productId })
      // });

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || 'Lỗi khi xoá sản phẩm khỏi khuyến mãi');

      // return data;
      const updatedPromotion = await removeProductFromPromotion(promotionId, productId, token);
      // setPromotion(updatedPromotion);
      toast.success('Đã xoá sản phẩm khỏi promotion');
    } catch (err) {
      console.error('Lỗi removeProductFromPromotion:', err);
      toast.error(`${err.message}`);
    }
  };

  const handleToggleActive = async (promotionId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // if (!token) throw new Error('Unauthorized – token missing');

    try {
      // const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/toggle`, {
      //   method: 'PATCH',
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // });

      // const data = await res.json();

      // if (!res.ok) throw new Error(data.message || 'Failed to toggle promotion status');

      // return data; // { message: "...", promotion: {...} }
      const updatedPromotion = await togglePromotionActive(promotionId, token);
      // setPromotion((prev) => ({
      //   ...prev,
      //   isActive: updatedPromotion.isActive
      // }));
      toast.success('Cập nhật trạng thái khuyến mãi thành công');
    } catch (err) {
      console.error('togglePromotion error:', err);
      toast.error(`${err.message}`);
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
        ></input>

        {loading && <p className="promo-form-info">Đang gửi dữ liệu...</p>}
        {error && <p className="promo-form-error">{error}</p>}
        {success && <p className="promo-form-success">Tạo chiến dịch thành công</p>}
      
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