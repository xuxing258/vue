const express = require("express");
const app = express()
app.listen("3000",()=>{console.log("3000端口开启");})

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(require("./middlewar/cors"))
//链接数据库
require("./middlewar/mongoose")

app.use(express.static("./public"))
//路由监听
app.use("/",require("./router/index"))


// // 防止未定义接口没有token认证 直接报错阻止代码运行
// app.use(function (err, req, res, next) {
//     if (err.name === 'UnauthorizedError') {	
//         //  这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
//       res.status(401).send('invalid token...');
//     }
// });