export const getProductBySlug = async (slug) => {
    if (!slug) throw new Error("Slug không được để trống.");
    
    const response = await fetch(`http://localhost:4000/api/products/${slug}`);
    if (!response.ok) {
        throw new Error("Sản phẩm không tồn tại hoặc có lỗi xảy ra.");
    }

    return await response.json();
};