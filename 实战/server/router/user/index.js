const express = require("express");
const router = express.Router();
const userSurface = require("../../db/user");
const {createToken,verifyToken} = require("../../middlewar/token")
const path = require('path')
const multer = require('multer')
const fs = require("fs");
// 存储上传文件地址
const upload   = multer({ 
    storage : multer.diskStorage({
        destination:(req, file, cb)=>{
            cb(null,path.resolve(__dirname,"../../public/uploads"))
        },
        filename:(req, file, cb)=>{
            cb(null,file.fieldname + Date.now().toString(36)+file.originalname)
        },
    })
}).single("file")

// 监听注册路由
router.post("/",async (req,res)=>{
    let reg = /^[^\s]{2,8}$/;
    let reg1 = /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{6,18}$/;
    const {name,pass} = req.body;
    if(!reg.test(name) || !reg1.test(pass)){
        return res.send({
            code:0,
            value:"失败"
        })
    }

    // 检测用户名是否注册
    let doc = await userSurface.findOne({user:name});
    if(doc){
        return  res.send({
            code:0,
            value:"用户名 已存在"
        })
    }
    
    //创建文档
    await userSurface.create({user:name,pass})
    res.send({
        code:1,
        value:"创建成功",
    })

   
})

// 登录验证
router.post("/verifyLogin",async (req,res)=>{
    let reg = /^[^\s]{2,8}$/;
    let reg1 = /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{6,18}$/;
    const {name,pass} = req.body;
    if(!reg.test(name) || !reg1.test(pass)){
        return res.send({
            code:0,
            value:"账号密码格式错误"
        })
    }
  
    // 检测用户名是否存在
    let doc = await userSurface.findOne({user:name}); // null 对象

    if(!doc){
        return  res.send({
            code:0,
            value:"账号错误"
        })
    }

    if(!(doc || doc.pass == pass)){
        return  res.send({
            code:0,
            value:"密码错误"
        })
    }

  
    // 设置token
    let tokenStr = createToken({ user:doc.user, photo:doc.photo})
    res.send({
        code:1,
        value:"登录成功",
        data:{
            photo:doc.photo,
            user:doc.user,
            tokenStr
        }
    })
})

// 验证登录
router.get("/automaticLogin",async (req,res)=>{
    if(req.headers['authorization'] == "null"){
      
        res.send({
            code:0,
            value:"登录失败"
        })
       
    }else{
        try{
            let {info} = await verifyToken(req.headers['authorization'].split(" ")[1]);
            res.send({
                code:1,
                value:"成功",
                data:{
                    photo:info.photo,
                    user:info.user,
                }
            })
        }catch(err){    
           
            res.send({
                code:0,
                value:"账号过期了",
               
            })
        }
    }
})

// 修改用户名
router.post("/changeUser",async (req,res)=>{
    let {user,tokenUese} = req.body
    // 检测用户名是否已经注册
    let doc = await userSurface.findOne({user:user}); // null 对象
    // true 用户已经被注册
    if(doc){
        return res.send({
            code:0,
            value:"用户名被注册"
        })
    }
    // 重新修改token
    let tokenStr = createToken({ user:user, photo:'/images/default.jpg'})
    // false 没有被注册 修改用户
    await userSurface.updateOne({user:tokenUese},{user:user})

   // 重新解析 重新赋值 不要前端发送数据了
    res.send({
        code:1,
        value:"用户修改成功",
        tokenStr,
    })
})

// 修改密码
router.post("/changePass",async (req,res)=>{
    let {user,pass,confirmPass} = req.body;
    let bol = await userSurface.findOne({user});

    try{
        if(bol.pass != pass)return res.send({ code:0,value:"原密码错误"});

        await userSurface.updateOne({user},{pass:confirmPass})

        res.send({
            code:1,
            value:"修改成功"
        })

    }catch(err){
       console.log(err);
    }

    
})

// 修改头像
router.post("/imagesPush",async (req,res)=>{
    let {info} = await verifyToken(req.headers['authorization'].split(" ")[1]);
           
     upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.send({
              code:0,
              value:"上传错误"
          })
        } else if (err) {
            return res.send({
                code:0,
                value:"未知错误"
            })
        }
        let fileName = req.file.filename
        //加密 token 
        let photo = "/uploads/"+fileName;
        let tokenStr = createToken({ user:info.user, photo:photo})
        await userSurface.updateOne({user:info.user},{photo:photo})

        // 删除文件
        if(info.photo !== "/uploads/default.jpg"){
            let pathFile = path.resolve(__dirname,"../../public/"+info.photo)
            fs.unlink(pathFile,(err,data)=>{ console.log(data) })
        }

        console.log(fileName,info);

        res.send({
            url:photo,
            tokenStr,
            code:1,
            value:"修改成功"
        })
      })
})

module.exports =  router