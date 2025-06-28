const express = require ('express')
const router=  express.Router()
const User = require('../models/UserModel')


router.get("/", async(req,res) => {
    try{
         const Users =  await User.find()
         res.json(Users)
    }catch (err){
        res.status(400).json({message:err.message})
    }

})

module.exports = router