import React from "react";
import "./Contact.css";
import { useForm, ValidationError } from '@formspree/react';

const ContactPage = () => {
  const [state, handleSubmit] = useForm("mdkderow");

  if (state.succeeded) {
      return (
        <div className="contact-container">
            <div className="main-section">
                <div className="contact-form" style={{textAlign: 'center'}}>
                    <h2>Cảm ơn bạn đã liên hệ!</h2>
                    <p>Chúng tôi sẽ phản hồi lại cho bạn trong thời gian sớm nhất.</p>
                </div>
                {/* Phần thông tin liên hệ vẫn giữ nguyên */}
                <div className="contact-info">
                  <h1>LIÊN HỆ</h1>
                  <p><strong>Các chi nhánh tại TP. Hồ Chí Minh :</strong></p>
                  <ul>
                    <li>SCD Quận 1: 252 Trần Hưng Đạo, phường Nguyễn Cư Trinh, Quận 1, Tp.HCM</li>
                    <li>SCD Quận 3: 432 Cao Thắng, phường 5, Quận 3, Tp.HCM</li>
                    <li>SCD Quận 4: 177 Khánh Hội, phường 3, Quận 4, Tp.HCM</li>
                    <li>SCD Quận 5: 227 Nguyễn Văn Cừ, phường 4, Quận 5, Tp.HCM</li>
                    <li>SCD Quận 7: 363 Lê Văn Lương, phường Tân Quy, Quận 7, Tp.HCM</li>
                    <li>SCD Quận 8: 37 Cao Lỗ, phường 4, Quận 8, Tp.HCM</li>
                  </ul>
                  <p><strong>Trụ sở chính :</strong></p>
                  <p>SCD Premium: 125 - 127 Lê Thánh Tôn, Bến Nghé, Quận 1</p>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="contact-container">
      <div className="main-section">
        {/* Contact Form */}
        <div className="contact-form">
          <h2>Thông tin tư vấn</h2>
          <form onSubmit={handleSubmit}>
            <input 
              id="name"
              type="text" 
              name="name"
              placeholder="Họ và tên" 
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />

            <input 
              id="phone"
              type="text" 
              name="phone"
              placeholder="Số điện thoại" 
            />
            <ValidationError prefix="Phone" field="phone" errors={state.errors} />
            
            <input 
              id="email"
              type="email" 
              name="email"
              placeholder="Email" 
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
            
            <textarea
              id="message"
              name="message"
              placeholder="Nội dung" 
              rows = {4}
            ></textarea>
            <ValidationError prefix="Message" field="message" errors={state.errors} />

            <button type="submit" disabled={state.submitting}>
              Gửi thông tin
            </button>
          </form>
        </div>

        <div className="contact-info">
          <h1>LIÊN HỆ</h1>
          <p><strong>Các chi nhánh tại TP. Hồ Chí Minh :</strong></p>
          <ul>
            <li>SCD Quận 1: 252 Trần Hưng Đạo, phường Nguyễn Cư Trinh, Quận 1, Tp.HCM</li>
            <li>SCD Quận 3: 432 Cao Thắng, phường 5, Quận 3, Tp.HCM</li>
            <li>SCD Quận 4: 177 Khánh Hội, phường 3, Quận 4, Tp.HCM</li>
            <li>SCD Quận 5: 227 Nguyễn Văn Cừ, phường 4, Quận 5, Tp.HCM</li>
            <li>SCD Quận 7: 363 Lê Văn Lương, phường Tân Quy, Quận 7, Tp.HCM</li>
            <li>SCD Quận 8: 37 Cao Lỗ, phường 4, Quận 8, Tp.HCM</li>
          </ul>
          <p><strong>Trụ sở chính :</strong></p>
          <p>SCD Premium: 125 - 127 Lê Thánh Tôn, Bến Nghé, Quận 1</p>
        </div>
      </div>

      <div className="map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4663936527195!2d106.68224637503155!3d10.774902189373056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ee7364f88e1%3A0x7b19fd888d41c1c!2zMjI3IE5ndXnhu4VuIFbEg24gQ-G7pywgUGjGsOG7nW5nIDQsIFF14bqjbSA1LCBUaOG7pyBDaMOtbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1685951602639!5m2!1svi!2s"
          title="Google Map"
          loading="lazy"
          allowFullScreen=""
        ></iframe>
      </div>
    </div>
  );
};

export default ContactPage;
