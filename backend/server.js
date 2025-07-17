// ====== BƯỚC 1: DEPENDENCIES ======
// Không cần require('cors') nữa
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// Các module khác
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const bcrypt = require('bcryptjs'); 

const app = express();
const port = process.env.PORT || 4000;

// ====== BƯỚC 2: THIẾT LẬP MIDDLEWARE ======
// Middleware để parse JSON body
app.use(express.json());

// Middleware để xử lý CORS thủ công (thay thế cho app.use(cors()))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ====== BƯỚC 3: KẾT NỐI DATABASE ======
mongoose.connect(process.env.MONGO_DB)
    .then(() => {
        console.log("Connect to MongoDB success!");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// ====== BƯỚC 4: API ROUTES ======
// Import các router
const productsRouter = require('./routes/productsRouter');
const userRouter = require('./routes/usersRouter');
const promotionRouter = require('./routes/promotionRouter');
const authRoutes = require('./routes/authRoutes');

// Sử dụng các routes
app.use('/api/products', productsRouter);
app.use('/api/users', userRouter);
app.use('/api/promotions', promotionRouter);
app.use('/api/auth', authRoutes);

// Route mặc định
app.get("/", (req, res) => {
    res.send("Express App is running successfully!");
});


// ====== BƯỚC 5: CODE NHÁP (MULTER) ======
/*
... (phần code multer giữ nguyên dưới dạng comment)
*/

// ====== BƯỚC 6: KHỞI CHẠY SERVER ======
app.listen(port, (error) => {
    if (!error) {
        console.log("Server started on port: " + port);
    } else {
        console.log("Error starting server: " + error);
    }
});