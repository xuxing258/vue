const mongoose = require("mongoose");
const Shcema = mongoose.Schema;

const userSurface =  new Shcema(
    {
        user:{
            type:String,
            required:true,
        },
        pass:{
            type:String,
            required:true,
        },
        photo:{
            type:String,
            default:"/uploads/default.jpg"
        }
    },  
    {
        versionKey:false
    }
)

module.exports  = mongoose.model("user",userSurface)