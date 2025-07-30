export const createOrder = async (orderData) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch('http://localhost:4000/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
     },
    body: JSON.stringify(orderData)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Có lỗi xảy ra khi đặt hàng");
    error.response = data;
    throw error;
  }

  return data;
};
