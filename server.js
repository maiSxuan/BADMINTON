const express = require ('express');
require ('dotenv').config();
const {default: mongoose} = require("mongoose");
const app = express()
const port  = process.env.PORT || 4001

app.use(express.json())


mongoose.connect (`${process.env.MONGO_DB}`)
.then(()=>{
    console.log("Connect db success!");
})
.catch((err)=>{
    console.log(err)
})

const addProductsRouter = require ('./routes/productsRouter')
app.use('/add-product',addProductsRouter)
app.listen(port, ()=>{console.log("Server started on port: ",+ port)})