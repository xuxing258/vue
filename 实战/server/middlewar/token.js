
const jwt = require('jsonwebtoken');  // 使用模块  生成token

// const secret = 'kite1874'    // 自定义钥匙名称

const createToken = (info) => {
    let token = "Bearer " + jwt.sign( {info}, "kite1874", {expiresIn: "24h" })
    return token
}

const verifyToken = (token)=> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, "kite1874", function(error, result)  {
            if(error){
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}


module.exports = {
    createToken,
    verifyToken
}