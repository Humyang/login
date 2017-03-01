import mFetch from './ajax.js'
import md5 from 'md5'
//登录
export const login = function(username,password){
    
    let data = {
        username,
        password:md5(password),
        device:'html5'
    }
    return mFetch('/login',data)
        .then(function(res){
            return res
        })
}
// 注册
export const regiest = function(username,password){
    let data = {
        username,
        password:md5(password)
    }
    return mFetch('/regiest',
        data)
}
// 测试登录状态
export const login_status_check = function(token){
    let data = {
        token
    }
    return mFetch('/login_status_check',
        data)
}