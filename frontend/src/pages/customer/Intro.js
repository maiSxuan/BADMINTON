import React from "react";
import { Sidebar } from "../../components/customer/Sidebar"; // Sidebar
import Breadcrumb from "../../components/common/breadcrumb";
import Header from "../../components/customer/Header"; // Header dùng chung
import Footer from "../../components/customer/Footer"; // Footer dùng chung
import "./Intro.css";

const Intro = () => {
  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Giới thiệu" },
  ];

  return (
    <>
      {/* Header cố định trên cùng */}
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      {/* Phần layout chính: Sidebar trái - Nội dung phải */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <Sidebar />
        </aside>

        {/* Nội dung chính */}
        <main className="main-content">
          <div className="intro-wrapper">
            <h1 className="intro-title">GIỚI THIỆU</h1>

            <h2 className="intro-subtitle">
              Giới thiệu SCD Badminton – Hệ thống cửa hàng cầu lông chuyên
              nghiệp tại Việt Nam
            </h2>

            <div>
              <p className="intro-paragraph">
                Ra đời từ niềm đam mê thể thao và khát khao phục vụ cộng đồng
                yêu thích cầu lông, SCD Badminton tự hào là một trong những hệ
                thống cửa hàng cầu lông uy tín và chuyên nghiệp tại Việt Nam.
                Với mạng lưới cửa hàng phủ sóng nhiều tỉnh thành, SCD Badminton
                không ngừng nỗ lực mang đến cho khách hàng những trải nghiệm mua
                sắm tốt nhất với sản phẩm chính hãng, chất lượng cao và dịch vụ
                tận tâm.
              </p>

              <p className="intro-paragraph">
                Khởi đầu từ một cộng đồng cầu lông nhỏ, SCD Badminton từng bước
                mở rộng quy mô hoạt động, đầu tư vào hệ thống website và fanpage
                để cập nhật nhanh chóng các thông tin về sản phẩm, chương trình
                ưu đãi và kiến thức chuyên sâu về cầu lông. Website chính thức
                của shop:{" "}
                <a
                  href="https://scdbadminton.com"
                  className="intro-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://scdbadminton.com
                </a>
                cùng fanpage Facebook là nơi chia sẻ, kết nối hàng ngàn người
                yêu thể thao trên khắp cả nước.
              </p>

              <p className="intro-paragraph">
                SCD Badminton cung cấp đa dạng các mặt hàng cầu lông: vợt cầu
                lông, giày, balo, túi đựng vợt, phụ kiện,... từ những thương
                hiệu hàng đầu thế giới như Yonex, Lining, Victor, Mizuno cho đến
                các dòng sản phẩm chất lượng tốt với giá cả phải chăng như
                Apacs, Kamito,.... Chúng tôi cam kết luôn cập nhật những mẫu mã
                mới nhất, phù hợp với mọi nhu cầu từ người mới bắt đầu đến vận
                động viên chuyên nghiệp.
              </p>

              <p className="intro-paragraph">
                Dịch vụ căng vợt được đánh giá cao nhờ hệ thống máy móc hiện đại
                và đội ngũ nhân viên kỹ thuật tay nghề cao, thường xuyên được
                đào tạo cập nhật công nghệ đan vợt tiên tiến.
              </p>
            </div>

            <div className="intro-section">
              <h3 className="intro-section-title">
                Tầm nhìn – Sứ mệnh – Giá trị cốt lõi của SCD Badminton
              </h3>

              <div>
                <h4 className="intro-subsection-title">Tầm nhìn:</h4>
                <p className="intro-paragraph">
                  Trở thành thương hiệu cầu lông hàng đầu Việt Nam, phân phối và
                  sản xuất sản phẩm thể thao chất lượng cao phục vụ người Việt.
                </p>

                <h4 className="intro-subsection-title">Sứ mệnh:</h4>
                <p className="intro-paragraph">
                  Cung cấp sản phẩm và dịch vụ tốt nhất, nâng cao trải nghiệm
                  chơi cầu lông và góp phần cải thiện sức khỏe cộng đồng.
                </p>

                <h4 className="intro-subsection-title">Giá trị cốt lõi:</h4>
                <ul className="intro-ul">
                  <li>
                    • Trung: Trung thực với khách hàng, đối tác và nhân viên.
                  </li>
                  <li>• Tín: Giữ chữ tín trong từng cam kết.</li>
                  <li>• Tâm: Luôn đặt khách hàng làm trung tâm.</li>
                  <li>• Trí: Sáng tạo, cải tiến không ngừng.</li>
                  <li>
                    • Nhân: Xây dựng văn hóa doanh nghiệp nhân văn và bền vững.
                  </li>
                </ul>
              </div>
            </div>

            <div className="intro-section">
              <h3 className="intro-section-title">
                Tầm nhìn – Sứ mệnh – Giá trị cốt lõi của SCD Badminton
              </h3>

              <div>
                <h4 className="intro-subsection-title">Tầm nhìn:</h4>
                <p className="intro-paragraph">
                  Trở thành thương hiệu cầu lông hàng đầu Việt Nam...
                </p>

                <h4 className="intro-subsection-title">Sứ mệnh:</h4>
                <p className="intro-paragraph">
                  Cung cấp sản phẩm và dịch vụ tốt nhất...
                </p>

                <h4 className="intro-subsection-title">Giá trị cốt lõi:</h4>
                <ul className="intro-ul">
                  <li>
                    • Trung: Trung thực với khách hàng, đối tác và nhân viên.
                  </li>
                  <li>• Tín: Giữ chữ tín trong từng cam kết.</li>
                  <li>• Tâm: Luôn đặt khách hàng làm trung tâm.</li>
                  <li>• Trí: Sáng tạo, cải tiến không ngừng.</li>
                  <li>
                    • Nhân: Xây dựng văn hóa doanh nghiệp nhân văn và bền vững.
                  </li>
                </ul>
              </div>
            </div>

            <div className="intro-slogan">
              Slogan: "Play your best – Choose SCD"
            </div>

            <div className="intro-box">
              <h4>Triết lý kinh doanh:</h4>
              <p>
                Tại SCD Badminton, chúng tôi tin rằng chất lượng là nền tảng,
                khách hàng là trọng tâm...
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Intro;
