// src/services/ratingService.js

// Thay đổi 'http://localhost:4000' thành địa chỉ server backend của bạn.
// '/api/ratings' là tiền tố route bạn đã định nghĩa trong file server chính (ví dụ: app.use('/api/ratings', ratingRoutes))
const BASE_URL = 'http://localhost:4000/api/ratings'; // <-- THAY ĐỔI NẾU CẦN

/**
 * Hàm trợ giúp để xử lý các phản hồi từ fetch.
 * Nó kiểm tra lỗi HTTP và phân tích cú pháp JSON.
 * @param {Response} response - Đối tượng Response từ fetch
 */
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

/**
 * Gửi một đánh giá mới cho một sản phẩm trong một đơn hàng cụ thể.
 * @param {object} ratingData - Dữ liệu đánh giá.
 * @param {string} ratingData.orderId - ID của đơn hàng.
 * @param {string} ratingData.productId - ID của sản phẩm (product_item).
 * @param {string} ratingData.userId - ID của người dùng.
 * @param {number} ratingData.rating - Số sao đánh giá (từ 1 đến 5).
 * @param {string} ratingData.comment - Nội dung bình luận.
 * @returns {Promise<object>} Dữ liệu trả về từ API, bao gồm cả đánh giá mới đã tạo.
 * @example
 * const newRating = await createRating({
 *   orderId: '60f...',
 *   productId: '60e...',
 *   userId: '60d...',
 *   rating: 5,
 *   comment: 'Sản phẩm rất tuyệt vời!'
 * });
 */
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

/**
 * Lấy tất cả đánh giá của một sản phẩm, có thể giới hạn số lượng.
 * @param {string} productId - ID của sản phẩm cần lấy đánh giá.
 * @param {number} [limit] - (Tùy chọn) Số lượng đánh giá tối đa muốn lấy.
 * @returns {Promise<object>} Một object chứa mảng `reviews` và `totalCount`.
 * @example
 * const { reviews, totalCount } = await getRatingsByProduct('60e...', 5); // Lấy 5 review mới nhất
 * console.log(`Sản phẩm này có tổng cộng ${totalCount} đánh giá.`);
 */
export const getRatingsByProduct = async (productId, limit) => {
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
};