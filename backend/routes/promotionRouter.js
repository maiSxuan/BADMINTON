const express = require('express')
const router = express.Router()
const Promotion = require('../models/Promotion')
router.get('/',async (req,res)=>{
    try{
        const promotion = await Promotion.find()
        res.json (promotion)
    }catch (err){
        res.status(500).json ({message:err.message})
    }
})

router.post("/",async(req,res)=>{
    try{
        const promotion = await Promotion.create({
            name:req.body.name,
            startDate:req.body.startDate,
            endDate:req.body.endDate,
            description:req.body.description
    })
    res.status(201).json(promotion);
    }catch(err){
        res.status(400).json({message:err.message})
    }
})

module.exports = router