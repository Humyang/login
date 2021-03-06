import expect from 'expect'
import * as API from './api/main.js'
import co from 'co'
import uid from 'uid'
var CODE =  require('../lib/constant.js').CODE

// import * as BASE from '../api/base.js'

describe('注册流程测试', function() {
    it('注册', function(done) {
        co(function*(){
            let username = 'test'+uid(10)
            let regiest_res = yield API.regiest(username,'password1','123456')
            expect(regiest_res.status).toBe(true,'测试注册')
            done()
        })
        .catch(function(err){
            if(err.STATUSCODE === CODE.VERIFY_INVALID.STATUSCODE){
                done()
            }else{
                done(err)    
            }
        })
    })

})

describe('登录流程测试', function() {

    it('注册后立即登录',function(done){
        co(function*(){
            let username = 'test'+uid(10)

            // var verifycode = yield API.verify_code()
            // expect(verifycode.status).toBe(true,'获取注册验证码')

            let regiest_res = yield API.regiest(username,'password1','123456')
            expect(regiest_res.status).toBe(true,'注册账号')

            var login = yield API.login(username,'password1',regiest_res.temp_verifycode,regiest_res.temp_token)
            done()
        }).catch(function(err){
            done(err)
        })
    })

    it('测试注册-登录-再次登录-旧token应当仍然有效', function(done) {
        co(function*(){
            let username = 'test'+uid(10)
            let regiest_res = yield API.regiest(username,'password1','123456')
            expect(regiest_res.status).toBe(true,'注册账号')
            var login = yield API.login(username,'password1',123456)
            expect(login.status).toBe(true,'登录')

            let token = login.token

            var login2 = yield API.login(username,'password1',123456)
            expect(login2.status).toBe(true,'再次登录，使旧token失效')
            
            var result = yield API.login_status_check(token)
            expect(result.status).toBe(true,'测试旧token有效性，应该有效')
            done()
            
        }).catch(function(err){

            if(err.STATUSCODE === CODE.LOGIN_TOKEN_INVALID.STATUSCODE){
                done()
            }else{
                done(err)    
            }
        })
    })

    it('检查账号重复性',function(done){
        co(function*(){
            let username = 'test'+uid(10)

            // var verifycode = yield API.verify_code()
            // expect(verifycode.status).toBe(true,'获取注册验证码')
            let regiest_res = yield API.regiest(username,'password1','123456')
            expect(regiest_res.status).toBe(true,'注册账号')

            // var verifycode2 = yield API.verify_code()
            // expect(verifycode2.status).toBe(true,'获取注册验证码')
            let regiest_res2 = yield API.regiest(username,'password1','123456')
            done('出现错误，账号名称重复，应抛出异常')
        }).catch(function(err){
            if(err.STATUSCODE === CODE.USERNAME_REPTER.STATUSCODE){
                done()
            }else{
                done(err)    
            }
        })
    })

    // it('不输入验证码',function(done){
    //     co(function*(){
    //         // var verifycode = yield API.verify_code()
    //         // expect(verifycode.status).toBe(true,'获取注册验证码')

    //         let regiest_res = yield API.login('123','123','','')
    //         done('出现错误，应该提示验证码不正确')
    //     }).catch(function(err){
    //         if(err.STATUSCODE === CODE.USERNAME_NO_FIND.STATUSCODE){
    //             done()
    //         }else{
    //             done(err)    
    //         }
    //     })
    // })

    it('不输入账号密码',function(done){
        co(function*(){
            // var verifycode = yield API.verify_code()
            // expect(verifycode.status).toBe(true,'获取注册验证码')
            let regiest_res = yield API.login('','')
            done('出现错误，应该提示没有找到此用户')
        }).catch(function(err){
            if(err.STATUSCODE === CODE.LOGIN_EMPTY.STATUSCODE){
                done()
            }else{
                done(err)    
            }
        })
    })

    it('输入错误账号密码',function(done){
        co(function*(){
            let username = 'test'+uid(10)
            
            // var verifycode = yield API.verify_code()
            // expect(verifycode.status).toBe(true,'获取注册验证码')

            let regiest_res = yield API.regiest(username,'password1')
            expect(regiest_res.status).toBe(true,'注册账号')

            // var verifycode2 = yield API.verify_code()
            // expect(verifycode2.status).toBe(true,'获取注册验证码')
            let regiest_res2 = yield API.login(username,1231241)
            done('出现错误，应该提示帐号密码错误')
        }).catch(function(err){
            if(err.STATUSCODE === CODE.USERNAME_ERROR.STATUSCODE){
                done()
            }else{
                done(err)    
            }
        })
    })
})

