var verifyUserName = require('./method.js').verifyUserName
var md5 = require('md5')
var uid = require('uid')
var throwError = require('./error.js').throwError
var CONSTANT = require('./constant.js')
var DAY = CONSTANT.DAY
var CODE = CONSTANT.CODE
var VERIFY = require('./verify.js')
var CONFIG = require('./config.js')
// 密码加密
function encryptPassword(password,salt){
    return md5(md5(password+salt))
}
//检查重复用户名
function* username_check(self,username){

    let username_query_filter = {
        username
    }
    console.log('this.LOGIN_CONFIG',self.LOGIN_CONFIG)
    let res = yield self.mongo 
                    .db(self.LOGIN_CONFIG.dbname)
                    .collection('user')
                    .findOne(username_query_filter)

    // console.log('res:',res)

    return res
}
function* regiest(next){
    let fields = this.request.fields
    // let fields = this.request.fields
    //验证码
    let username = fields.username
    let password = fields.password
    if(!VERIFY.loginVerify(username,password)){
        throwError(CODE.LOGIN_EMPTY)
    }
    //验证码检查
    // let verifycode = yield verify_code(this,fields.token,fields.verify_code)
    // console.log('verifycode',verifycode)

    // 验证账号格式
    if(!verifyUserName(fields.username)){
        // throw new Error('账号格式不符合要求');
        throwError(CODE.USERNAME_INVALID)
    }
    // 验证密码格式


    // 验证账号重复性
    let _username = yield username_check(this,fields.username)

    // console.log('_username：',_username)
    if(_username!=null){
        throwError(CODE.USERNAME_REPTER)
    }

    let salt = md5(Math.random()*1000000)
    password = encryptPassword(fields.password,salt)
    let now = new Date()

    let uid2 = uid(40)

    let data = {
        username:fields.username,
        password,
        salt,
        uid:uid2,
        regiest_date:now.getTime()
        // 弹性添加其它字段
    }
    // 账号写入数据库
    let _inset_res = yield this.mongo
                    .db(this.LOGIN_CONFIG.dbname)
                    .collection('user')
                    .insert(data)

    // console.log('inset_res：',_inset_res)

    // 获取用于登录的token
    let temptoken = yield get_verifytoken(this)

    // 响应
    this.body = {
      status:true,
      res:_inset_res,
      temp_token:temptoken.token,
      temp_verifycode:temptoken.verify_code
    }
}
function* login(next){
    let fields = this.request.fields
    //验证码
    let username = fields.username
    let password = fields.password

    //密码参数基本判断 不允许密码为空
    if(!VERIFY.loginVerify(username,password)){
        throwError(CODE.LOGIN_EMPTY)
    }

    //获取 salt
    let salt = yield this.mongo
                        .db(this.LOGIN_CONFIG.dbname)
                        .collection('user')
                        .findOne({username:username})
    if(salt === null){
        throwError(CODE.USERNAME_NO_FIND)
    }
    // console.log('salt，',salt)
    // console.log('encryptPassword',encryptPassword(fields.password,salt.salt))
    //验证账号密码
    let _usm_pwd_filter = {
        username:username,
        password:encryptPassword(password,salt.salt)
    }
    console.log('_usm_pwd_filter: ',_usm_pwd_filter)
    let _usm_pwd = yield this.mongo 
                        .db(this.LOGIN_CONFIG.dbname)
                        .collection('user')
                        .findOne(_usm_pwd_filter);
    // console.log('_usm_pwd，',_usm_pwd)
    if(_usm_pwd === null){
        // throw new Error('账号密码错误')
        throwError(CODE.USERNAME_ERROR)
    }

    //token 写入有效状态
    let new_token = uid(40)
    let _token_stauts = {
        username:username,
        status:true,
        token:new_token
        // ,
        // device:fields.device
    }
    console.log('new_token',new_token)
    //使旧 token 失效
    // 不使旧token失效，因为要支持多设备登录
    // let _remove_token = yield this.mongo
    //                             .db(this.LOGIN_CONFIG.dbname)
    //                             .collection('logined_token')
    //                             .update({
    //                                     username:fields.username,
    //                                     device:fields.device
    //                                 },
    //                                     {'$set':{status:false}},
    //                                     {'upsert':false})

    // console.log('_remove_token: ',_remove_token)
    let _insert_res = yield this.mongo
                    .db(this.LOGIN_CONFIG.dbname)
                    .collection('logined_token')
                    .insert(_token_stauts)
    // console.log('_insert_res',_insert_res)

    // 登录成功
    this.body = {
      status:true,
      token:new_token
    }
}
function* verifycode(next){

    let insert_res = yield get_verifytoken(this)

    this.body = {
      status:true,
      token:insert_res.token,
      verify_code:insert_res.verify_code
    }
}
function* get_verifytoken(self){
    // 生成 Token
    let token = uid(40)
    
    // 生成 验证码
    let verify_code = "123456"
    // 验证码转换为 base64 图片
    // Token，verify_code 存入数据库

    let now = new Date()
    let create_time = now.getTime()
    let expire_time = create_time + DAY*1
    let data = {
        token,
        verify_code,
        create_time,
        expire_time,
        is_verify:false
    }

    let res = yield self.mongo
                    .db(self.LOGIN_CONFIG.dbname)
                    .collection('token')
                    .insert(data)

    return {token,verify_code}
}
function* username_repeat(next){
    let _username = yield username_check(this,this.params.username)
    // console.log('_username：',_username)
    if(_username!=null){
        throw new Error('账号重复');
    }
    this.body = {
        status:true
    }
}
//middleware
function login_check(){
    return function * plugin (next) {
        let token = this.request.fields.token
        let _login_check_res = yield this.mongo
                    .db(this.LOGIN_CONFIG.dbname)
                    .collection('logined_token')
                    .findOne({token:token})
        if(_login_check_res === null){
            // throw new Error('未登陆')
            throwError(CODE.LOGIN_NO_LOGIN)
        }
        if(_login_check_res.status === false){
            throwError(CODE.LOGIN_TOKEN_INVALID)
        }

        // console.log('_login_check_res',_login_check_res)
        // 2016年11月28日17:55:51 todo：
        // _login_check_res.username
        // 获取 user 的资料
        let userinfo = yield this.mongo
                                .db(this.LOGIN_CONFIG.dbname)
                                .collection('user')
                                .findOne({username:_login_check_res.username})

       this.login_status = {
            uid:userinfo.uid
        }
        yield next
    } 
}
function verify_code(){
    return function*(next){
        let fields = this.request.fields
        let query_filter = {
            token:fields.token,
            verify_code:fields.verify_code.toString()
        }
        let _vc = yield this.mongo 
                            .db(this.LOGIN_CONFIG.dbname)
                            .collection('token')
                            .findOne(query_filter);
        // 验证验证码
        if(_vc==null){
            throwError(CODE.VERIFY_ERROR)
        }
        if(_vc.is_verify===true){
            throwError(CODE.VERIFY_INVALID)
        }
        let verifytoken = yield this.mongo
                                    .db(this.LOGIN_CONFIG.dbname)
                                    .collection('token')
                                    .update({token:fields.token},
                                        {'$set':{is_verify:true}})
        yield next
    }
}
function set(option){
    return function*(next){
        console.log('option----------',option)
        this.LOGIN_CONFIG = {
            dbname: option.dbname || 'LOGINSERVER',
            port: option.port || 8200
        }
        console.log('this.LOGIN_CONFIG------------',this.LOGIN_CONFIG)
        yield next
    }
}
module.exports = {
    regiest,
    login,
    verifycode,
    login_check,
    verify_code,
    username_repeat,
    set
}