  import React, { useState, useEffect } from 'react';
  import "./PromotionList.css"
  import  Pagination  from '../../components/common/Pagination';
  import { Trash, SquarePen } from 'lucide-react';
  const PromotionListPage = () => {
    //lấy data
    const [promotions, setPromotions] = useState([]);
    //set up page
    const [currentPage, setCurrentPage] = useState(1);
    let promotionsPerPage = 10;
    useEffect(() => {
    const getPromotionData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/promotions"); 
        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status}`);
        }
        const data = await response.json();
        setPromotions(data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu chiến dịch:", err);
      }
    };

    getPromotionData(); 
  }, []);
    const indexOfLastpromotion =currentPage * promotionsPerPage;
    const indexOfFirstpromotion = indexOfLastpromotion - promotionsPerPage;
    const currentpromotions = promotions.slice(indexOfFirstpromotion,indexOfLastpromotion)
    const paginate = (pageNumbers) => setCurrentPage(pageNumbers)
    const handleDeletePromotion = async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này?")) return;

      try {
        const response = await fetch("http://localhost:4000/api/promotions/" + id, {
          method: "DELETE",
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `Lỗi HTTP: ${response.status}`);
        }
        setPromotions(prevpromotions => prevpromotions.filter(promotion => promotion._id !== id));
        alert("Xóa chiến dịch thành công.");
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    };
    return (
      <div className="promotion-list-page"> 
        <div className="table-container">
          {promotions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Tên chiến dịch</th>
                  <th>Ngày Bắt Đầu</th>
                  <th>Ngày Kết Thúc</th>
                  <th>Chỉnh sửa</th>
                </tr>
              </thead>
              <tbody>
                {currentpromotions.filter((promotion) => !promotion.isAdmin )
                .map((promotion) => (
                  <tr key={promotion._id}>
                    <td>{promotion.name}</td>
                    <td>
                    {new Date(promotion.startDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="center-cell-center">
                        <button>
                          <SquarePen color="grey" size="20" />
                        </button>
                        <button onClickCapture={() => handleDeletePromotion(promotion._id)}>
                          <Trash color="red" size="20" />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có chiến nào để hiển thị.</p>
          )}
        </div>
        <Pagination itemsPerPage={promotionsPerPage} totalItems={promotions.length} paginate={paginate} currentPage={currentPage} className="promotion-pagination"/>
      </div>
  );
  };

  export default PromotionListPage;