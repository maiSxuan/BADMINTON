export const createPromotion = async (token, promotionData) => {
  const response = await fetch('http://localhost:4000/api/promotions', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(promotionData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Tạo chiến dịch thất bại.');
  }

  return result; // { message, promotion }
};

export const updatePromotion = async (token, promotionId, updatedData) => {
  const response = await fetch(`http://localhost:4000/api/promotions/${promotionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updatedData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Cập nhật chiến dịch thất bại.');
  }

  return result; // { message, promotion }
};

export const deletePromotion = async (token, promotionId) => {
  const response = await fetch(`http://localhost:4000/api/promotions/${promotionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Xoá chiến dịch thất bại.');
  }

  return result; // { message: '...' }
};

export const fetchAllPromotions = async (token) => {
  if (!token) throw new Error('Chưa đăng nhập');

  const res = await fetch('http://localhost:4000/api/promotions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Lỗi khi lấy danh sách chiến dịch');

  return data.promotions; // array
};

export const fetchPromotionById = async (promotionId, token) => {
  if (!token) throw new Error('Chưa đăng nhập');

  const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Lỗi khi lấy chi tiết chiến dịch');

  return data.promotion; // object
};

export const addCodesToPromotion = async (promotionId, codes, token) => {
  if (!token) throw new Error('Chưa đăng nhập');

  if (!Array.isArray(codes) || codes.length === 0)
    throw new Error('Danh sách mã giảm giá không hợp lệ');

  const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/add-codes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ codes })
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Lỗi khi thêm mã giảm giá');

  return data.updatedPromotion;
};

export const removeCodesFromPromotion = async (promotionId, codes, token) => {
  if (!token) throw new Error('Chưa đăng nhập');

  if (!Array.isArray(codes) || codes.length === 0)
    throw new Error('Danh sách mã cần xoá không hợp lệ');

  const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/remove-codes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ codes })
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Lỗi khi xoá mã');

  return data.updatedCodes; // array hoặc object, tùy vào backend
};

export const addProductsToPromotion = async (promotionId, productDiscounts, token) => {
  if (!token) throw new Error('Chưa đăng nhập');

  if (!Array.isArray(productDiscounts) || productDiscounts.length === 0) {
    throw new Error('Danh sách sản phẩm cần áp mã không hợp lệ');
  }

  const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/add-products`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productDiscounts })
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Lỗi khi thêm sản phẩm vào khuyến mãi');

  return data.updatedPromotion; // Giả sử BE trả về promotion đã cập nhật
};

export const removeProductFromPromotion = async (promotionId, productId, token) => {
  if (!token) throw new Error('Chưa đăng nhập');
  if (!promotionId || !productId) throw new Error('Thiếu thông tin promotionId hoặc productId');

  const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/products/remove`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId })
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Lỗi khi xoá sản phẩm khỏi khuyến mãi');

  return data.updatedPromotion; // giả định BE trả về promotion đã cập nhật
};

export const togglePromotionActive = async (promotionId, token) => {
  if (!token) throw new Error('Unauthorized – token missing');
  if (!promotionId) throw new Error('Thiếu promotionId');

  const res = await fetch(`http://localhost:4000/api/promotions/${promotionId}/toggle`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Failed to toggle promotion status');

  return data.promotion; // giả định BE trả về { message, promotion }
};
