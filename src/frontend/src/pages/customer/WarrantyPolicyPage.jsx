import React from 'react';
import './WarrantyPolicyPage.css'; // Tái sử dụng CSS từ trang đổi trả
import { Link } from 'react-router-dom';


const WarrantyPolicyPage = () => {
  return (
    <div className="policy-page-container">
      <div className="policy-main-content">
        <h1 className="policy-title">Chính sách bảo hành</h1>
        <div className="policy-meta">
          <span>SCD BADMINTON</span>
        </div>
        <div className="policy-body">     
            <h2 className="policy-subtitle">1. Các trường hợp đủ điều kiện bảo hành</h2>
            <ul>
                <li>Sản phẩm trong thời hạn còn bảo hành.</li>
                <li>Sản phẩm bị lỗi do nhà sản xuất.</li>
                <li>Phiếu bảo hành còn nguyên vẹn.</li>
            </ul>

            <h2 className="policy-subtitle">2. Trường hợp không được bảo hành</h2>
            <ul>
                <li>Sản phẩm đã quá thời hạn ghi trên Phiếu bảo hành hoặc mất Phiếu bảo hành.</li>
                <li>Phiếu bảo hành không ghi rõ mã số sản phẩm và ngày mua hàng.</li>
                <li>Mã số sản phẩm và Phiếu bảo hành không trùng khớp nhau hoặc không xác định được vì bất kỳ lý do nào.</li>
                <li>Sản phẩm bị trầy xước, móp méo, biến dạng do người dùng gây ra quá trình sử dụng.</li>
                <li>Khách hàng tự ý can thiệp, sửa chữa sản phẩm hoặc đem đến một nơi nào khác sửa chữa.</li>
                <li>Sản phẩm được hãng kiểm tra và báo lỗi do người sử dụng gây ra (có giấy xác nhận từ hãng).</li>
            </ul>

            <h2 className="policy-subtitle">3. Quy trình bảo hành sản phẩm</h2>
            <p><strong>Bước 1:</strong> Khi phát hiện lỗi sản phẩm, quý khách vui lòng giữ nguyên hiện trạng sản phẩm, liên hệ ngay với Shop SCD Badminton để yêu cầu bảo hành.</p>
            <p><strong>Bước 2:</strong> Quý khách xuất trình Phiếu bảo hành còn đầy đủ thông tin mã sản phẩm, ngày mua hàng.</p>
            <p><strong>Bước 3:</strong> Shop SCD Badminton sẽ nhận sản phẩm kèm phiếu bảo hành từ quý khách và gửi về nhà sản xuất để kiểm tra.</p>
            <p><strong>Bước 4:</strong> Trong trường hợp sản phẩm bị lỗi do nhà sản xuất, quý khách sẽ được đổi sản phẩm mới.</p>
            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Trường hợp quý khách mua hàng trực tiếp tại chi nhánh, vui lòng liên hệ trực tiếp qua hotline chi nhánh.</li>
                <li>Trường hợp quý khách mua hàng qua website, vui lòng liên hệ trực tiếp qua hotline <a href="tel:0948245045" className="hotline-link">0948245045</a> .</li>
                <li> <p>Quý khách có thể gửi form tư vấn tại trang <Link to="/contact">Liên Hệ</Link> để chúng tôi có thể giải đáp thắc mắc của quý khách trong thời gian sớm nhất. </p></li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPolicyPage;