import { useState, useEffect } from 'react';
import "./PromotionList.css"
import Pagination from '../../components/common/Pagination';
import Select from 'react-select'
import { Trash, SquarePen } from 'lucide-react';
import { deletePromotion, getAllPromotions, getPromotionById, addCodeToPromotion, addProductToPromotion, removeCodeFromPromotion, removeProductFromPromotion, updatePromotion, togglePromotionStatus } from '../../services/index';
import { getProductsOnQuery } from '../../services/index';
import { usePopup } from '../../components/common/popupContext';

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
  const { showPopup } = usePopup()

  useEffect(() => {
    const displayPromotions = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await getAllPromotions();
        setPromotions(res.promotions || []);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách chiến dịch khuyến mãi:', err);
        // setError(err.message || 'Không thể tải danh sách chiến dịch khuyến mãi');
        showPopup(
          'Lỗi',
          err.message || 'Không thể tải danh sách chiến dịch khuyến mãi',
          null,
          null,
          4,
          1
        )
      } finally {
        setLoading(false)
      }
    };
    displayPromotions();
  }, [showPopup]);

  const reloadPrommotions = async () => {
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
      showPopup(
        'Thông báo',
        'Lỗi khi xem chi tiết chiến dịch. Vui lòng thử lại sau!',
        null,
        null,
        4,
        1
      )
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    showPopup(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa chiến dịch giảm giá này',
      'Xóa',
      async () => {
        try {
          await deletePromotion(promotionId);
          await reloadPrommotions();
          showPopup(
            'Thông báo',
            'Xóa chiến dịch khuyến mãi thành công',
            null,
            null,
            4,
            1
          )
        } catch (err) {
          console.error('Lỗi khi xóa chiến dịch:', err.message)
          showPopup(
            'Lỗi',
            err.message || 'Xóa chiến dịch khuyến mãi thất bại',
            null,
            null,
            4,
            1
          )
        }
      },
      4
    )
  };

  const handleAddDiscountCode = async () => {
    if (!newCode || !discountType || !discountValue) {
      showPopup(
        'Thông báo',
        'Vui lòng nhập đầy đủ thông tin mã giảm giá',
        null,
        null,
        4,
        1
      )
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
      showPopup(
        'Thông báo',
        'Thêm mã giảm giá thành công',
        null,
        null,
        4,
        1
      )
    } catch (err) {
      console.error("Lỗi khi thêm mã:", err.message);
      showPopup(
        'Lỗi',
        err.message || 'Thêm mã giảm giá thất bại hoặc mã giảm đã tồn tại',
        null,
        null,
        4,
        1
      )
    }
  };

  const handleDeleteDiscountCode = async (code) => {
    if (!selectedPromotion?._id) return;

    showPopup(
      'Xác nhận xóa',
      'Bạn chắc chắn xóa mã giảm giá được chọn?',
      'Xóa',
      async () => {
        try {
          const res = await removeCodeFromPromotion(selectedPromotion._id, [code]);
          setSelectedPromotion((prev) => ({
            ...prev,
            listCode: res.updatedCodes,
            productDiscounts: res.updatedPromotion?.productDiscounts || [],
          }));
          showPopup(
            'Thành công',
            'Xóa mã giảm giá thành công!',
            null,
            null,
            4,
            1
          );
        } catch (err) {
          console.error('Xóa mã giảm giá thất bại', err.message)
          showPopup(
            'Lỗi',
            'Xóa mã giảm giá thất bại. Vui lòng thử lại.',
            null,
            null,
            4,
            1
          );
        }
      },
      6
    )
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
      showPopup(
        'Thông báo',
        'Vui lòng nhập đầy đủ thông tin mã giảm giá',
        null,
        null,
        4,
        1
      )
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
      showPopup(
        'Thông báo',
        'Áp dụng mã khuyến mãi thành công',
        null,
        null,
        4,
        1
      )
    } catch (err) {
      console.error(err.message || "Lỗi khi áp dụng mã");
      showPopup(
        'Lỗi',
        err.message || 'Áp dụng mã không thành công!',
        null,
        null,
        4,
        1
      )
    }
  };

  const handleDeleteProductFromPromotion = async (productId) => {
    if (!selectedPromotion?._id) return;
    showPopup(
      'Xác nhận xóa',
      'Bạn muốn xóa sản phẩm này khỏi chiến dịch giảm giá?',
      'Xóa',
      async () => {
        try {
          const res = await removeProductFromPromotion(selectedPromotion._id, productId._id);

          setSelectedPromotion(res.updatedPromotion);
          showPopup(
            'Thông báo',
            'Xóa sản phẩm thành công',
            null,
            null,
            4,
            1
          )
        } catch (err) {
          console.error('Xóa sản phẩm thất bại', err.message)
          showPopup(
            'Lỗi',
            err.message || 'Xóa sản phẩm không thành công',
            null,
            null,
            4,
            1
          )
        }
      }
    )
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
      setSelectedPromotion(null);
      setEditMode(false);
      setStep(null);
      showPopup(
        'Thông báo',
        'Cập nhật thông tin thành công',
        null,
        null,
        4,
        1
      )
      await reloadPrommotions();
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin', err.message)
      showPopup(
        'Lỗi',
        err.message || 'Cập nhật thông tin thất bại',
        null,
        null,
        4,
        1
      )
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
          p._id === promotionId ? { ...p, isActive: toggleStatus.isActive } : p
        )
      );
    } catch (err) {
      showPopup(
        'Lỗi',
        err.message || 'Cập nhật trạng thái thất bại',
        null,
        null,
        4,
        1
      )
    }
  }

  function LoadingSpinner() {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  function ErrorMessage({ message }) {
        return (
            <div className="error-container">
                <p className="error-message">{message}</p>
            </div>
        );
    }

  const [currentPage, setCurrentPage] = useState(1);
  let promotionsPerPage = 2;
  const indexOfLastpromotion = currentPage * promotionsPerPage;
  const indexOfFirstpromotion = indexOfLastpromotion - promotionsPerPage;
  const currentpromotions = promotions.slice(indexOfFirstpromotion, indexOfLastpromotion)
  const paginate = (pageNumbers) => setCurrentPage(pageNumbers)

  return (
    <div className="promotion-list-page">
      {loading ? (
        // <p>Đang tải danh sách chiến dịch ...</p>
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
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
                      {/* <select
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
                      </select> */}
                      <Select 
                        className='select-search-dropdown'
                        classNamePrefix='select-search-dropdown'
                        value={allProducts.map(p => ({ value: p.id, label: p.name })).find(opt => opt.value === selectedProductId) || null}
                        onChange={(opt) => setSelectedProductId(opt.value)}
                        options={allProducts.map(p => ({ value: p.id, label: p.name}))}  
                        placeholder='-- Chọn sản phẩm --'
                        isSearchable
                      />

                      <select
                        value={selectedCode}
                        onChange={(e) => setSelectedCode(e.target.value)}
                        
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
                {currentpromotions.filter((promotion) => !promotion.isAdmin)
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
                          {(() => {
                            const now = new Date();

                            const promoStart = new Date(promotion.startDate);
                            const promoEnd = new Date(promotion.endDate);

                            promoStart.setHours(0, 0, 0, 0);
                            promoEnd.setHours(23, 59, 59, 999);

                            const isActive = promotion.isActive &&
                              promoStart <= now &&
                              promoEnd >= now;

                            const isExpired = now > promoEnd;

                            return (
                              <>
                                <span className={isActive ? 'promo-status-active' : 'promo-status-inactive'}>
                                  {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                </span>
                                <button
                                  className={`toggle-btn ${isActive ? 'toggled' : ''}`}
                                  onClick={() => !isExpired && handlePromotionStatus(promotion._id)}
                                  disabled={isExpired}
                                >
                                  <div className='thumb'></div>
                                </button>
                              </>
                            );
                          })()}
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
      <Pagination itemsPerPage={promotionsPerPage} totalItems={promotions.length} paginate={paginate} currentPage={currentPage} className="promotion-pagination" />
    </div>
  );
};

export default PromotionListPage;