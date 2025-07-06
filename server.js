const express = require ('express');
// npm install cors
// const cors = require('cors') 
require ('dotenv').config();
const {default: mongoose} = require("mongoose");
const app = express()
const port  = process.env.PORT || 4001

app.use(express.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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

const productsRouter = require ('./routes/productsRouter')
app.use('/api/products',productsRouter)
const userRouter = require ('./routes/usersRouter')
app.use('/api/users',userRouter)
const promotionRouter = require('./routes/promotionRouter')
app.use('/api/promotions',promotionRouter)
app.listen(port, ()=>{console.log("Server started on port: ",+ port)})