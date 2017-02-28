import mFetch from './ajax.js'
import md5 from 'md5'
//登录
export const login = function(username,password,token){
    
    let data = {
        username,
        password:md5(password),
        device:'html5',
        token
    }
    return mFetch('/login',data)
        .then(function(res){
            // saveUsername(username)
            return res
        })
}
// 注册
export const regiest = function(username,password,token){
    let data = {
        username,
        password:md5(password),
        token
    }
    return mFetch('/regiest',
        data)
}
