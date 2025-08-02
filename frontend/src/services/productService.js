export const getProductBySlug = async (slug) => {
    if (!slug) throw new Error("Slug không được để trống.");
    
    const response = await fetch(`http://localhost:4000/api/products/${slug}`);
    if (!response.ok) {
        throw new Error("Sản phẩm không tồn tại hoặc có lỗi xảy ra.");
    }
    
    return await response.json();
};
// Hàm này đã sẵn sàng để nhận một object
export const getProductsOnQuery = async (queryParams = {}) => {
    const params = new URLSearchParams({
        view: 'public',
        ...queryParams 
        
    });

    const response = await fetch(`http://localhost:4000/api/products?${params.toString()}`);
    if (!response.ok) throw new Error('Không thể tải sản phẩm.');

    return await response.json();
};

export const addProduct = async (productPayload) => {
    const res = await fetch(`http://localhost:4000/api/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productPayload),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Không thể tạo sản phẩm mới');
    }

    return res.json(); 
};


export const deleteProduct = async (slug) => {
    const response = await fetch(`http://localhost:4000/api/products/${slug}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa sản phẩm.');
    }

    return response.json();
};


export const togglePublishProduct = async (slug) => {
    const response = await fetch(`http://localhost:4000/api/products/${slug}/toggle-publish`, {
        method: 'PATCH',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thay đổi trạng thái sản phẩm.');
    }

    return response.json();
};