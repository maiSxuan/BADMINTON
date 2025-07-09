const mongoose= require('mongoose')
const promotionSchema = new mongoose.Schema(
    {
      name:{type:String, required:true,unique:true},
      startDate:{type:Date, required:true},
      endDate:{type:Date, required: true},
      description:{type:String, required: true}  
    },
    {
        timestamps: true
    }

)
const Promotion = mongoose.model("Promotion",promotionSchema)
module.exports= Promotion