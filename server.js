const express = require ('express');
// npm install cors
// const cors = require('cors') 
require ('dotenv').config();
const {default: mongoose} = require("mongoose");
const app = express()
const port  = process.env.PORT || 4001

app.use(express.json())

//middleware dùng để kết nối giũa frontend với backend 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//hoặc dùng 
// app.use(cors())

mongoose.connect (`${process.env.MONGO_DB}`)
.then(()=>{
    console.log("Connect db success!");
})
.catch((err)=>{
    console.log(err)
})

const addProductsRouter = require ('./routes/productsRouter')
app.use('/add-product',addProductsRouter)
const addUserRouter = require ('./routes/usersRouter')
app.use('/admin/user-list',addUserRouter)

app.listen(port, ()=>{console.log("Server started on port: ",+ port)})