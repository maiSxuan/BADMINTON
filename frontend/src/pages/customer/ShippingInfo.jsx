import "./ShippingInfo.css";
import { useState, useEffect } from "react";
import axios from "axios";

const ShippingInfo = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        houseNumber: "",
        storeLocation: "",
        note: "",
        shippingMethod: "",
        saveInfo: false,
    })

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [errors, setErrors] = useState({});
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/?depth=3")
            .then((res) => setCities(res.data))
            .catch((err) => console.error("Failed to load cities", err));
    }, []);

    useEffect(() => {
        const selectedCity = cities.find(c => c.name === formData.city);
        setDistricts(selectedCity ? selectedCity.districts : []);
        setFormData(prev => ({ ...prev, district: "", ward: ""}));
    }, [formData.city, cities]);

    useEffect(() => {
        const selectedDistrict = districts.find(d => d.name === formData.district);
        setWards(selectedDistrict ? selectedDistrict.wards : []);
        setFormData(prev => ({ ...prev, ward: ""}));
    }, [formData.district, districts]);

    useEffect(() => {
        const { houseNumber, ward, district, city } = formData;
        const components = [houseNumber, ward, district, city].filter(Boolean);
        const fullAddress = components.join(", ");
        
        if (formData.address !== fullAddress) {
            setFormData((prev) => ({
                ...prev,
                address: fullAddress
            }));
        }
    }, [formData.houseNumber, formData.ward, formData.district, formData.city]);

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;

        if (!formData.fullName.trim())
            newErrors.fullName = "Họ và tên không được để trống";
        if (!formData.phone.trim())
            newErrors.phone = "Số điện thoại không được để trống";
        else if (!phoneRegex.test(formData.phone))
            newErrors.phone = "Số điện thoại này không hợp lệ";

        if (!formData.email.trim())
            newErrors.email = "Email không được để trống";
        else if (!emailRegex.test(formData.email))
            newErrors.email = "Email không hợp lệ";

        if (!formData.houseNumber.trim())
            newErrors.houseNumber = "Số nhà, tên đường không được để trống";   
        return newErrors;
    }

    const ErrorText = ({ message }) => (
        <span className="error-message">{ message }</span>
    );
     
    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const validateErrors = validate();
        setErrors(validateErrors);  

        // console.log("Form submitted:", formData)
        if (Object.keys(validateErrors).length === 0) {
            console.log("Form submitted:", formData);
            setIsConfirmed(true);
        }
    }

    return (
        <div className="shipping-container">
            <div className="shipping-form-wrapper">
                <h1 className="shipping-form-title">Thông tin vận chuyển</h1>

                {isConfirmed ? (
                    <div className="shipping-confirmation">
                        <h2 className="shipping-confirmation-title">
                            Thông tin vận chuyển của bạn đã được xác nhận
                        </h2>
                        <button 
                            className="shipping-confirmation-button"
                            onClick={() => alert("Tiếp tục thanh toán")}
                        >
                            Tiếp tục thanh toán
                        </button>
                    </div>

                ) : (
                    <form onSubmit={handleSubmit} className="shipping-form">
                        <div className="shipping-form-row">
                            <div className="shipping-form-group">
                                <label htmlFor="fullName" className="shipping-form-label">Họ tên người nhận</label>
                                <input 
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="shipping-form-input"
                                    required 
                                />
                            </div>
                            {errors.fullName && <ErrorText message={errors.fullName} />}

                            <div className="shipping-form-group">
                                <label htmlFor="phone" className="shipping-form-label">Số điện thoại</label>
                                <input 
                                    type="tel" 
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="shipping-form-input"
                                    required
                                />
                            </div>
                            {errors.phone && <ErrorText message={errors.phone} />}

                            <div className="shipping-form-group">
                                <label htmlFor="email" className="shipping-form-label">Email</label>
                                <input 
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="shipping-form-input" 
                                    required
                                />
                            </div>
                            {errors.email && <ErrorText message={errors.email} />}

                            <div className="shipping-form-group">
                                <label htmlFor="address" className="shipping-form-label">Địa chỉ giao hàng</label>
                                <input 
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="shipping-form-input"
                                    disabled 
                                    readOnly
                                />
                            </div>

                            <div className="shipping-sub-address">
                                <div className="shipping-form-group">
                                    <label htmlFor="city" className="shipping-form-label">Tỉnh/ Thành phố</label>
                                    <select 
                                        id="city"
                                        name="city" 
                                        value={formData.city} 
                                        onChange={handleInputChange} 
                                        className="shipping-form-select"
                                        required
                                    >
                                        <option value="">- Chọn tỉnh/ thành phố -</option>
                                        {cities.map((c) => (
                                            <option key={c.code} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-form-group">
                                    <label htmlFor="district" className="shipping-form-label">Quận/ Huyện</label>
                                    <select 
                                        id="district"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        className="shipping-form-select"
                                        required
                                    >
                                        <option value="">- Chọn quận/ huyện -</option>
                                        {districts.map((d) => (
                                            <option key={d.code} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-form-group">
                                    <label htmlFor="ward" className="shipping-form-label">Phường/ Xã</label>
                                    <select 
                                        id="ward"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleInputChange}
                                        className="shipping-form-select"
                                        required
                                    >
                                        <option value="">- Chọn phường/ xã -</option>
                                        {wards.map((w) => (
                                            <option key={w.code} value={w.name}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-form-group">
                                    <label htmlFor="houseNumber" className="shipping-form-label">Số nhà, tên đường</label>
                                    <input 
                                        type="text"
                                        id="houseNumber"
                                        name="houseNumber"
                                        value={formData.houseNumber}
                                        onChange={handleInputChange}
                                        className="shipping-form-input"
                                        required 
                                    />
                                </div>
                                {errors.houseNumber && <ErrorText message={errors.houseNumber} />}
                            </div>

                            <div className="shipping-form-group">
                                <label htmlFor="storeLocation" className="shipping-form-label">Vị trí cửa hàng</label>
                                <select 
                                    id="storeLocation"
                                    name="storeLocation"
                                    value={formData.storeLocation}
                                    onChange={handleInputChange}
                                    className="shipping-form-select"
                                    required
                                >
                                    <option value="">- Chọn cửa hàng -</option>
                                    <option value="storePremium">SCD Premium</option>
                                    <option value="store1">SCD Quận 1</option>
                                    <option value="store3">SCD Quận 3</option>
                                    <option value="store4">SCD Quận 4</option>
                                    <option value="store5">SCD Quận 5</option>
                                    <option value="store7">SCD Quận 7</option>
                                    <option value="store8">SCD Quận 8</option>
                                </select>
                            </div>

                            <div className="shipping-form-group">
                                <label htmlFor="note" className="shipping-form-label">Ghi chú (tùy chọn)</label>
                                <input 
                                    type="text"
                                    id="note"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    className="shipping-form-input"
                                    placeholder="Ghi chú thêm về địa chỉ giao hàng..." 
                                />
                            </div>

                            <div className="shipping-form-group">
                                <label htmlFor="shippingMethod" className="shipping-form-label">Phương thức giao hàng</label>
                                <select 
                                    id="shippingMethod"
                                    name="shippingMethod"
                                    value={formData.shippingMethod}
                                    onChange={handleInputChange}
                                    className="shipping-form-select"
                                    required
                                >
                                    <option value="">- Chọn phương thức giao hàng -</option>
                                    <option value="standard">Giao hàng tiêu chuẩn</option>
                                    <option value="express">Giao hàng nhanh</option>
                                    <option value="same-day">Giao hàng trong ngày</option>
                                    <option value="pickup">Nhận tại cửa hàng</option>
                                </select>
                            </div>
                        </div>

                        <div className="shipping-checkbox-group">
                            <input 
                                type="checkbox"
                                id="saveInfo"
                                name="saveInfo"
                                checked={formData.saveInfo}
                                onChange={handleInputChange}
                                className="shipping-form-checkbox" 
                            />
                            <label htmlFor="saveInfo" className="shipping-checkbox-label">
                                Lưu thông tin cho lần sau
                            </label>
                        </div>
                        
                        <div className="shipping-submit-wrapper">
                            <button type="submit" className="shipping-submit-button">
                                Xác nhận
                            </button>
                        </div>
                    </form>
                )} 
            </div>
        </div>
    )
};

export default ShippingInfo;