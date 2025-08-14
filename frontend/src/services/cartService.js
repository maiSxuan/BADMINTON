export const fetchCart = async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) return

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

export const updateCartItemQuantity = async (variantId, payload) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

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

export const removeItemFromCart = async (variantId, payload) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

  const res = await fetch(`http://localhost:4000/api/cart/${variantId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Remove item failed. Status: ${res.status}`);
  }

  return await res.json();
};

export const addItemToCart = async ({ productId, variantId, optionId, quantity }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return;

  const res = await fetch('http://localhost:4000/api/cart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product: productId,
      variant_id: variantId,
      option_id: optionId,
      quantity: quantity,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Add to cart failed. Status: ${res.status}`);
  }

  return await res.json(); 
};

export const clearAllCart = async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return;

  const res = await fetch('http://localhost:4000/api/cart', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } 
  });

  if (!res.ok)
    throw new Error("Failed to clear cart");

  return await res.json();
}

export const removeSelectedItemsFromCart = async (items) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

  const res = await fetch(`http://localhost:4000/api/cart/items/bulk`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });

  if (!res.ok)
    throw new Error('Remove selected items failed');

  return await res.json();
} 


