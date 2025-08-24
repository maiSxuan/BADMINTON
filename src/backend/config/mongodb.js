const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_DB) {
            console.error("Lỗi: Biến môi trường MONGO_DB không được thiết lập.");
            process.exit(1); // Thoát ứng dụng với mã lỗi
        }
        await mongoose.connect(process.env.MONGO_DB);
        console.log("Connect to MongoDB success!");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
};
module.exports = connectDB;