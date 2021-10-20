const express = require("express");
const router = express.Router();

// 监听注册路由
router.use("/user",require("./user/index"))



module.exports =  router