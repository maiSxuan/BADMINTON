const BASE_URL = 'http://localhost:4000/api/ratings'; 

const handleResponse = async (response) => {
  // fetch không reject promise cho các mã lỗi HTTP, vì vậy chúng ta phải kiểm tra thủ công.
  if (!response.ok) {
    // Cố gắng lấy message lỗi từ body của response
    const errorData = await response.json().catch(() => ({ message: 'Không thể phân tích lỗi từ server.' }));
    const errorMessage = errorData.message || `Lỗi HTTP! Trạng thái: ${response.status}`;
    throw new Error(errorMessage);
  }
  // Nếu phản hồi OK, phân tích cú pháp JSON
  return response.json();
};

export const createRating = async (ratingData) => {
  try {
    const response = await fetch(`${BASE_URL}/createRating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData),
    });
    return handleResponse(response); // API trả về { message, data }
  } catch (error) {
    console.error('Lỗi khi tạo đánh giá:', error.message);
    // Ném lỗi ra ngoài để component có thể bắt và xử lý
    throw error;
  }
};

export const  getRatingsByProduct = async (productId, limit) => {
    // Xây dựng URL với query params một cách an toàn
    const params = new URLSearchParams();
    if (limit) {
      params.append('limit', limit);
    }
    
    // Nối chuỗi query vào URL nếu có
    const queryString = params.toString();
    const url = `${BASE_URL}/product/${productId}${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      return handleResponse(response); // API trả về { reviews, totalCount }
    } catch (error) {
      console.error(`Lỗi khi lấy đánh giá cho sản phẩm ${productId}:`, error.message);
      throw error;
    }
}