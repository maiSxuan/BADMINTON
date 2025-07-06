require('dotenv').config();
console.log("MONGODB_URI:", process.env.MONGODB_URI);

const port = process.env.PORT || 4000;
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const bcrypt = require('bcryptjs'); 
const cors = require("cors");
const { error } = require("console");

//ADD const routes
// const productRoutes = require("./routes/productRoutes");
// const userRoutes = require("./routes/userRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cors());

//database connection with mongodb
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

//add call Routes
// app.get("/", (req, res)=>{
//     res.send("Express App is running")
// })

app.use("/api/auth", authRoutes);


app.listen(port,(error)=>{
    if(!error){
        console.log("Server running on port " +port)
    }else{
        console.log("Error : "+error)
    }
})

//-----------------------------------------------------------------------------------------------------------------
//NHÁP
// //image storage engine
// const storage = multer.diskStorage({
//     destination: './upload/images',
//     filename:(req, file, cb)=>{
//         return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })

// const upload = multer({storage:storage})

// //Creating upload endpoint for images
// app.use('/images', express.static('upload/images'))
// app.post("/upload", upload.single('product'), (req, res)=>{
//     res.json({
//         success:1,
//         image_url:`http://localhost:${port}/images/${req.file.filename}`
//     })
// })
