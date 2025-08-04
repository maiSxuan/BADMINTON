  import { useState, useEffect } from 'react';
  import "./PromotionList.css"
  import  Pagination  from '../../components/common/Pagination';
  import { Trash, SquarePen } from 'lucide-react';
  import { deletePromotion, getAllPromotions, getPromotionById, addCodeToPromotion, addProductToPromotion, removeCodeFromPromotion, removeProductFromPromotion, updatePromotion, togglePromotionStatus } from '../../services/index';
  import { getProductsOnQuery } from '../../services/index';
  import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

  const PromotionListPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [step, setStep] = useState(1);

    const [newCode, setNewCode] = useState("");
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState("");
  
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedCode, setSelectedCode] = useState("");
    const [allProducts, setAllProducts] = useState([]);

    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
      const displayPromotions = async() => {
        setLoading(true);
        setError('');

        try {
          const res = await getAllPromotions();
          setPromotions(res.promotions || []);
        } catch (err) {
          console.error('Lỗi khi lấy danh sách chiến dịch khuyến mãi:', err);
          setError(err.message || 'Không thể tải danh sách chiến dịch khuyến mãi');
        } finally {
          setLoading(false)
        }
      };
      displayPromotions();
    }, []);

    const reloadPrommotions = async() => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      try {
        const res = await getAllPromotions(token);
        setPromotions(res.promotions || []);
      } catch (err) {
        console.error('Lỗi khi reload promotions:', err);
      }
    };

    const displayDetailPromotions = async (promotionId) => {
      try {
        const data = await getPromotionById(promotionId);
        setSelectedPromotion(data);
        setStep(1);
        setShowDetail(true);
      } catch (err) {
        console.error('Lỗi khi xem chi tiết chiến dịch khuyến mãi:', err.message);
      }
    };

    const handleDeletePromotion = async (promotionId) => {
      const confirm = window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này?")
      if (!confirm) return;

      try {
        await deletePromotion(promotionId);
        // setPromotions(prev => prev.filter(p => p._id !== promotionId));
        await reloadPrommotions();
      } catch (err) {
        console.error('Lỗi khi xóa chiến dịch:', err.message)
      }
    };

    const handleAddDiscountCode = async () => {
      if (!newCode || !discountType || !discountValue) {
        toast.warning('Vui lòng nhập đầy đủ thông tin mã giảm giá');
        return;
      }

      const newCodeObj = {
        code: newCode,
        discountType,
        discountValue: parseFloat(discountValue)
      };

      try {
        const res = await addCodeToPromotion(selectedPromotion._id, [newCodeObj]);
        setSelectedPromotion(res.updatedPromotion);
        setNewCode('');
        setDiscountType('percentage');
        setDiscountValue('');
        toast.success("Thêm mã giảm giá thành công")
      } catch (err) {
        console.error("Lỗi khi thêm mã:", err.message);
      }
    };

    const handleDeleteDiscountCode = async (code) => {
      if (!selectedPromotion?._id) return;

      try {
        const res = await removeCodeFromPromotion(selectedPromotion._id, [code]);
        setSelectedPromotion((prev) => ({
          ...prev,
          listCode: res.updatedCodes,
          productDiscounts: res.updatedPromotion?.productDiscounts || [],
        }));
        toast.success('Xóa mã giảm giá thành công');
      } catch (err) {
        toast.error('Xóa mã thất bại');
      }
    };

    useEffect(() => {
      const fetchProducts = async () => {
        const res = await getProductsOnQuery({ limit: 1000, view: "admin" });
        setAllProducts(res.data);
      };
      fetchProducts();
    }, []);

    const handleAddProductToPromotion = async () => {
      if (!selectedProductId || !selectedCode) {
        toast.warning("Vui lòng chọn sản phẩm và mã");
        return;
      }

      try {
        const res = await addProductToPromotion({
          promotionId: selectedPromotion._id,
          productId: selectedProductId,
          code: selectedCode,
        });

        setSelectedPromotion(res.updatedPromotion);
        setSelectedProductId(''); 
        setSelectedCode(''); 
        toast.success("Áp dụng mã khuyến mãi thành công");

      } catch (err) {
        console.error(err.message || "Lỗi không xác định khi áp dụng mã");
      }
    };

    const handleDeleteProductFromPromotion = async (productId) => {
      if (!selectedPromotion?._id) return;

      try {
        const res = await removeProductFromPromotion(selectedPromotion._id, productId._id);

        setSelectedPromotion(res.updatedPromotion);
        toast.success('Xóa sản phẩm thành công');
      } catch (err) {
        toast.error('Xóa sản phẩm thất bại');
      }
    };

    const handleUpdatePromotion = async (e) => {
      e.preventDefault();

      const updatedData = {
        name: selectedPromotion.name,
        description: selectedPromotion.description,
        startDate: selectedPromotion.startDate,
        endDate: selectedPromotion.endDate
      };

      try {
        await updatePromotion(selectedPromotion._id, updatedData);
        // setSelectedPromotion(res.promotion);
        setSelectedPromotion(null); 
        setEditMode(false);
        setStep(null);
        toast.success('Cập nhật thông tin thành công');
        await reloadPrommotions();
      } catch (err) {
        toast.error('Cập nhật thất bại');
      }
    }

    const handleEditPromotion = (promotion) => {
      setSelectedPromotion(promotion);
      setEditMode(true);
      setStep(null); 
    };

    const handlePromotionStatus = async (promotionId) => {
      try {
        const toggleStatus = await togglePromotionStatus(promotionId);
        
        setPromotions((prevPromotions) => 
          prevPromotions.map((p) =>
            p._id === promotionId ? {...p, isActive: toggleStatus.isActive} : p
          )
        );
      } catch (err) {
        toast.error(err.message || 'Cập nhật trạng thái thất bại');
      }
    }

    const [currentPage, setCurrentPage] = useState(1);
    let promotionsPerPage = 10;
    const indexOfLastpromotion =currentPage * promotionsPerPage;
    const indexOfFirstpromotion = indexOfLastpromotion - promotionsPerPage;
    const currentpromotions = promotions.slice(indexOfFirstpromotion,indexOfLastpromotion)
    const paginate = (pageNumbers) => setCurrentPage(pageNumbers)
    
    return (
      <div className="promotion-list-page"> 
      {loading ? (
        <p>Đang tải danh sách chiến dịch ...</p>
      ) : error ? (
        <p className='promotion-error'>{error}</p>
      ):(
        <div className="promo-table-container">
          {showDetail && selectedPromotion && (
            <div className="promotion-detail-panel">
              <div className="promo-panel-header">
                <h3 className='promotion-header'>{selectedPromotion.name}</h3>
                <button onClick={() => setShowDetail(false)}>Đóng</button>
              </div>

              <div className="promo-step-navigation">
                <button onClick={() => setStep(1)} className={step === 1 ? 'active' : ''}>Thông tin</button>
                <button onClick={() => setStep(2)} className={step === 2 ? 'active' : ''}>Mã giảm giá</button>
                <button onClick={() => setStep(3)} className={step === 3 ? 'active' : ''}>Sản phẩm</button>
              </div>

              <div className="promo-step-content">
                
                {step === 1 && selectedPromotion && (
                  <div className="promotion-info">
                    <table className="promotion-table">
                      <tbody>
                        <tr>
                          <th>Mã chiến dịch</th>
                          <td>{selectedPromotion._id}</td>
                        </tr>
                        <tr>
                          <th>Tên chiến dịch</th>
                          <td>{selectedPromotion.name}</td>
                        </tr>
                        <tr>
                          <th>Mô tả</th>
                          <td>{selectedPromotion.description}</td>
                        </tr>
                        <tr>
                          <th>Thời gian</th>
                          <td>
                            {new Date(selectedPromotion.startDate).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(selectedPromotion.endDate).toLocaleDateString("vi-VN")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {step === 2 && (
                  <div className="promotion-discount-tab">
                    <table className="promotion-table">
                      <thead>
                        <tr>
                          <th>Mã giảm giá</th>
                          <th>Giá trị</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPromotion.listCode.map((code, index) => (
                          <tr key={index}>
                            <td><strong>{code.code}</strong></td>
                            <td>
                              {code.discountType === 'percentage'
                                ? `${code.discountValue}%`
                                : code.discountType === 'fixed'
                                  ? `${Number(code.discountValue).toLocaleString()}₫`
                                  : 'Không xác định'}
                            </td>
                            <td>
                              <button 
                                className="promo-table-action-btn"
                                onClick={() => handleDeleteDiscountCode(code.code)}
                              >
                                <Trash color="red" size="20" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className='promo-add-discount-form'>
                      <input 
                        type="text"
                        placeholder='Tên mã giảm giá'
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)} 
                      />
                      <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                        <option value="percentage">Phần trăm</option>
                        <option value="fixed">Giảm trực tiếp</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Giá trị" 
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)} 
                      />
                      <button onClick={handleAddDiscountCode}>Xác nhận thêm mã</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="promotion-product-tab">
                    <table className="promotion-table">
                      <thead>
                        <tr>
                          <th>Tên sản phẩm</th>
                          <th>Giá sau khi giảm</th>
                          <th>Mã áp dụng</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPromotion.productDiscounts.map((item, index) => (
                          <tr key={index}>
                            <td><strong>{item.productId?.name}</strong></td>
                            <td>{item.productId?.sale_price?.toLocaleString()}₫</td>
                            <td><strong>{item.code}</strong></td>
                            <td>
                              <button 
                                className="promo-table-action-btn"
                                onClick={() => handleDeleteProductFromPromotion(item.productId)}
                              >
                                <Trash color="red" size="20" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="promo-product-add-row">
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="dropdown"
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {allProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedCode}
                        onChange={(e) => setSelectedCode(e.target.value)}
                        className="dropdown"
                      >
                        <option value="">-- Chọn mã khuyến mãi --</option>
                        {selectedPromotion?.listCode?.map((code, index) => (
                          <option key={`${code.code}-${index}`} value={code.code}>
                            {code.code} - {code.discountValue}{code.discountType === "percentage" ? "%" : "₫"}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleAddProductToPromotion()}
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {editMode && selectedPromotion && (
            <div className='promotion-update-form'>
              <h3>Cập nhật thông tin chiến dịch khuyến mãi: {selectedPromotion.name}</h3>
              <form onSubmit={handleUpdatePromotion}>
                <input
                  type="text"
                  placeholder="Tên chiến dịch"
                  value={selectedPromotion.name}
                  onChange={(e) =>
                    setSelectedPromotion((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <input
                  type="date"
                  value={new Date(selectedPromotion.startDate).toISOString().split('T')[0]}
                  onChange={(e) =>
                    setSelectedPromotion((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
                <input
                  type="date"
                  value={new Date(selectedPromotion.endDate).toISOString().split('T')[0]}
                  onChange={(e) =>
                    setSelectedPromotion((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
                <textarea
                  placeholder="Mô tả"
                  value={selectedPromotion.description}
                  onChange={(e) =>
                    setSelectedPromotion((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <div className='promo-edit-button'>
                  <button type="submit">Xác nhận cập nhật</button>
                  <button type="button" onClick={() => setEditMode(false)}>Huỷ</button>
                </div>
              </form>
            </div>
          )}
          {promotions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Mã chiến dịch</th>
                  <th>Tên chiến dịch</th>
                  <th>Ngày Bắt Đầu</th>
                  <th>Ngày Kết Thúc</th>
                  <th>Chỉnh sửa</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentpromotions.filter((promotion) => !promotion.isAdmin )
                .map((promotion) => (
                  <tr key={promotion._id}>
                    <td>
                      <button onClick={() => displayDetailPromotions(promotion._id)} className='promotion-id'>{promotion._id.slice(0, 6)}</button>
                    </td>
                    <td>{promotion.name}</td>
                    <td> {new Date(promotion.startDate).toLocaleDateString("vi-VN")} </td>
                    <td> {new Date(promotion.endDate).toLocaleDateString("vi-VN")} </td>
                    <td className="promo-edit-cell">
                        <button onClick={() => handleEditPromotion(promotion)}>
                          <SquarePen color="grey" size="20" />
                        </button>
                        <button onClickCapture={() => handleDeletePromotion(promotion._id)}>
                          <Trash color="red" size="20" />
                        </button>
                    </td>
                    <td>
                      <div className='promotion-status-cell'>
                        <span className={promotion.isActive ? 'promo-status-active' : 'promo-status-inactive'}>
                          {promotion.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                        </span>
                        <button 
                          className={`toggle-btn ${promotion.isActive ? 'toggled' : ''}`} 
                          onClick={() => handlePromotionStatus(promotion._id)}
                        >
                          <div className='thumb'></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có chiến dịch khuyến mãi nào để hiển thị</p>
          )}
        </div>
      )}
        <Pagination itemsPerPage={promotionsPerPage} totalItems={promotions.length} paginate={paginate} currentPage={currentPage} className="promotion-pagination"/>
        <ToastContainer position='top-right' autoClose={3000} />
      </div>
    );
  };

  export default PromotionListPage;