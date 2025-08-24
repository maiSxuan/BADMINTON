import React from 'react';
import './ReturnPolicyPage.css'; 
import { Link } from 'react-router-dom';


const ReturnPolicyPage = () => {
  return (
    <div className="policy-page-container">
      <div className="policy-main-content">
        <h1 className="policy-title">Chính sách đổi trả, hoàn tiền</h1>
        <div className="policy-meta">
          <span>SCD BADMINTON</span>
        </div>
        <div className="policy-body">
            <p>Trường hợp quý khách mua hàng trực tiếp tại chi nhánh, vui lòng liên hệ trực tiếp qua hotline chi nhánh để được hỗ trợ.</p>
            <p>Trường hợp quý khách mua hàng qua website, vui lòng liên hệ trực tiếp qua hotline <a href="tel:0948245045" className="hotline-link">0948245045</a>.</p>
            <p>Quý khách có thể gửi form tư vấn tại trang <Link to="/contact">Liên Hệ</Link> để chúng tôi có thể giải đáp thắc mắc của quý khách trong thời gian sớm nhất. </p>
            
            <h2 className="policy-subtitle">1. SCD Badminton cho phép quý khách được đổi/trả hàng trong những trường hợp sau</h2>
            <ul>
                <li>Sản phẩm không vừa size.</li>
            </ul>
            <p>Người mua có thể yêu cầu đổi/trả hàng khi sản phẩm không vừa ý trong vòng 1 ngày kể từ khi nhận hàng. SCD Badminton sẽ đổi sản phẩm cho khách. Sản phẩm muốn đổi/trả cần giữ nguyên hiện trạng, chưa sử dụng.</p>
            <ul>
                <li>Sản phẩm mua bị lỗi, quá hạn sử dụng.</li>
            </ul>
            <p>Quý khách vui lòng kiểm tra sản phẩm trước khi thanh toán. Trong trường hợp sản phẩm bị lỗi do nhà sản xuất, hoặc bị hư hại trong quá trình vận chuyển làm ảnh hưởng đến ngoại hình và tính năng của sản phẩm, quý khách vui lòng từ chối nhận hàng và gửi lại sản phẩm cho chúng tôi.</p>
            <ul>
                <li>Sản phẩm không sử dụng được ngay khi được giao.</li>
            </ul>
            <p>Quý khách vui lòng đọc kỹ tem hướng dẫn sử dụng và chắc rằng sản phẩm phù hợp với nhu cầu của bạn. Quý khách có thể liên hệ với SCD Badminton để được hướng dẫn sử dụng sản phẩm. Trong trường hợp sản phẩm không đáp ứng được nhu cầu của quý khách, quý khách vui lòng phản hồi lại với SCD Badminton và gửi trả sản phẩm lại cho chúng tôi.</p>
            <ul>
                <li>Sản phẩm giao không đúng theo đơn đặt hàng.</li>
            </ul>
            <p>Nếu sản phẩm giao đến không đúng với đơn hàng quý khách đã đặt, quý khách vui lòng liên hệ lại với SCD Badminton để xác nhận lại đơn đặt hàng. Trong trường hợp lỗi do sai sót từ phía cửa hàng, SCD Badminton sẽ tiến hành đổi/trả sản phẩm cho quý khách.</p>

            <h2 className="policy-subtitle">2. Điều kiện đổi trả hàng</h2>
            <p>Thời gian yêu cầu đổi/trả: trong vòng 01 ngày kể từ khi nhận được hàng và phải liên hệ gọi ngay cho chúng tôi theo hotline <a href="tel:0948245045" className="hotline-link">0948245045</a>. để được xác nhận đổi trả hàng.</p>
            <p><strong>Điều kiện:</strong></p>
            <ul>
                <li>Sản phẩm gửi lại phải còn nguyên đai nguyên kiện.</li>
                <li>Phiếu bảo hành (nếu có) và tem của công ty trên sản phẩm còn nguyên vẹn.</li>
                <li>Sản phẩm đổi trả phải còn đầy đủ hộp, chưa qua sử dụng.</li>
                <li>Quý khách chịu chi phí vận chuyển, đóng gói (đối với sản phẩm đổi size).</li>
            </ul>

            <h2 className="policy-subtitle">3. Quy trình đổi trả hàng</h2>
            <ul>
                <li>Đối với khách mua hàng trực tiếp tại cửa hàng:</li>
            </ul>
            <p>Quý khách cần kiểm tra kỹ sản phẩm trước khi thanh toán. Trường hợp mua làm quà tặng, đổi size thì mang trực tiếp tới cửa hàng mua để được nhân viên e.shop hỗ trợ.</p>
            <ul>
                <li>Đối với khách hàng mua online tại Website:</li>
            </ul>
            <p>+ Quý khách hàng được phép kiểm tra hàng trước khi nhận ( được đồng kiểm tra sản phẩm với shipper giao hàng). Trong trường hợp phát hiện lỗi, không đúng với mô tả hoặc hình ảnh trên website, quý khách hàng trả hàng trực tiếp cho shipper và vui lòng liên hệ ngay với SCD Badminton để yêu cầu đổi/trả hàng.</p>
            <p>+ Trường hợp sau khi nhân viên giao hàng đã đi – Nếu muốn đổi trả hàng có thể liên hệ với chúng tôi qua hotline <a href="tel:0948245045" className="hotline-link">0948245045</a> để được xử lý và hẹn lịch đổi trả hàng.</p>
        </div>
      </div>
      
    </div>
  );
};

export default ReturnPolicyPage;