const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/blog").then(()=>{
    console.log("链接成功");
}).catch(()=>{
    console.log("链接失败");
})