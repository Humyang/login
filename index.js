var app = require('koa')()
var body = require('koa-better-body')
var router = require('koa-router')()
var cors = require('koa-cors')
var mongo = require('koa-mongo')



var CONSTANT = require('./lib/constant.js')
var objectAssign = require('object-assign')
var LOGIN = require('./lib/login.js')
var CONFIG = require('./lib/config.js')
app.use(cors())
// 验证账号重复性
router.all('/valid/username/:username',LOGIN.username_repeat)
//注册账户
router.post('/regiest',/*LOGIN.verify_code(),*/LOGIN.regiest)
//登录
router.post('/login',/*LOGIN.verify_code(),*/LOGIN.login)
//登录
router.post('/login_status_check',LOGIN.login_check(),function *(next){
    this.body = {
        status:true,
        msg:'登录中'
    }
})
//获取验证码
router.all('/verify_code',LOGIN.verifycode)

app.use(mongo())
app.use(body())
app.use(function *(next){
    try{
        yield next
    }catch (err) {
        try{
            // 业务逻辑错误
            this.body = objectAssign({status:false},JSON.parse(err.message));
        }catch(err2){
            // console.log(this)
            this.body = {
                status:false,
                msg:err.message,
                path:this.request.url
            }
        }
        console.log(err)
    }
})
app.use(router.routes()).use(router.allowedMethods());


// https://github.com/koajs/examples/blob/master/errors/app.js
// 
// this.app.emit('error', err, this);
// app.on('error', function(err) {
//     console.log('error:',err)
//     this.body={
//         status:false,
//         err
//     }
//   // if (process.env.NODE_ENV != 'test') {
//   //   console.log('sent error %s to the cloud', err.message);
//   //   console.log(err);
//   // }
// });
// app.use(function*(next){
//     console.log(next)
//     console.log(22222)
// })

app.listen(CONFIG.port)

console.log("listen serve on port "+CONFIG.port)