export const getAllBrands = async () => {
    const res = await fetch('http://localhost:4000/api/brands');
    if (!res.ok) throw new Error("Không thể tải danh sách thương hiệu");
    return res.json();
};