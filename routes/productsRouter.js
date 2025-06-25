const express = require ('express')
const router = express.Router() 
const Product = require ('../models/ProductModel')
//getting all
router.get('/',async (req,res)=>{
    try{
        const products = await Product.find()
        res.json (products)
    }catch (err){
        res.status(500).json ({message:err.message})
    }
})
//getting one
router.get('/:id',getProduct,(req,res)=>{
    res.send(res.product.name)
})
//create one
router.post('/', async (req,res)=>{
    const product = new Product({
        name: req.body.name,
        type: req.body.type,
        price: req.body.price,
        countInStock: req.body.countInStock,
        description: req.body.description,
    })
    try{
        const newProduct = await product.save()
        //201: successfully create new object
        res.status(201).json(newProduct)
    }catch (err){
        res.status(400).json({message:err.message})
    }
})
//update one
router.patch('/:id',getProduct,async (req,res)=>{
    if (req.body.name != null){
        res.product.name = req.body.name
    }
     if (req.body.name != null){
        res.product.price = req.body.price
    }
     if (req.body.name != null){
        res.product.description = req.body.description
    }
     if (req.body.name != null){
        res.product.type = req.body.type
    }
     if (req.body.name != null){
        res.product.brand = req.body.brand
    }
    try {
        const updatedProduct = await res.product.save()
        res.json(updatedProduct)
    }catch (err){
        res.status(400).json({message: err.message})

    }
})

//delete one 
router.delete('/:id',getProduct,async (req,res)=>{
    try {
        await res.product.deleteMany()
        res.json({message:'deleted product'})
    }catch(err){
        res.status(500).json({message:err.message})
    }
})
async function getProduct (req,res, next){
    try{
        product = await Product.findById(req.params.id)
        if (product == null){
            return res.status(404).json({message:'Cannot find product'})
        }
    } catch (err){
        return res.status(500).json ({message: err.message})
    }

    res.product = product
    next()
}

module.exports = router