export const getAllCategories = async () => {
    const res = await fetch('http://localhost:4000/api/categories');
    if (!res.ok) throw new Error('Không thể tải danh sách danh mục');
    return res.json();
};

export const createCategoryByName = async (name) => {
    const response = await fetch(`http://localhost:4000/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo ngành hàng mới.');
    }
    return await response.json();
};
