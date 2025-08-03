export const fetchCart = async (token) => {
  const response = await fetch('http://localhost:4000/api/cart', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error! status: ${response.status}`);
  }

  return await response.json();
};

export const updateCartItemQuantity = async (token, variantId, payload) => {
  const response = await fetch(`http://localhost:4000/api/cart/${variantId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Update quantity failed. Status: ${response.status}`);
  }

  return await response.json(); 
};

export const removeItemFromCart = async (token, variantId, payload) => {
  const response = await fetch(`http://localhost:4000/api/cart/${variantId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Remove item failed. Status: ${response.status}`);
  }

  return await response.json();
};

export const addItemToCart = async (token, payload) => {
  const response = await fetch('http://localhost:4000/api/cart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Add to cart failed. Status: ${response.status}`);
  }

  return await response.json(); 
};

// const handleAddToCart = async () => {
//   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//   if (!token) return alert("Bạn cần đăng nhập trước.");

//   const payload = {
//     product: selectedProductId,
//     variant_id: selectedVariantId,
//     option_id: selectedOptionId,
//     quantity: selectedQuantity
//   };

//   try {
//     const result = await addToCart(token, payload);
//     console.log('Add product successfully:', result.message);
//   } catch (err) {
//     console.error('Error adding product:', err.message);
//     alert(err.message || "Không thể thêm vào giỏ hàng.");
//   }
// };

