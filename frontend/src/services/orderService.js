const BASE_URL = "http://localhost:4000/api/order";
const token = localStorage.getItem('token') || sessionStorage.getItem('token');

export const createOrder = async (orderData) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
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

export const getAllOrders = async () => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching orders:", error)
    return { success: false, error }
  }
}

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error }
  }
}

export const getCancelledReqOrders = async () => {
  const response = await fetch(`${BASE_URL}/cancellation-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy danh sách đơn hủy")
  }
  return data.data
}

export const getReturnRefundReqOrders = async () => {
  const response = await fetch(`${BASE_URL}/return-refund-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy danh sách đơn hoàn/trả hàng")
  }
  return data.data
}

export const getOrdersByUserId = async (userId) => {
  const response = await fetch(`${BASE_URL}/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy đơn hàng")
  }
  return data.data
}

export const requestReturnOrCancellation = async (orderId, type, reason) => {
  const response = await fetch(`${BASE_URL}/request/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ type, reason }),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể gửi yêu cầu")
  }
  return data
}
