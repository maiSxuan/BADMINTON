export const getAllCategories = async () => {
    const res = await fetch('http://localhost:4000/api/categories');
    if (!res.ok) throw new Error('Không thể tải danh sách danh mục');
    return res.json();
};