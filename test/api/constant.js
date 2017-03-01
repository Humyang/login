let setip=''
if (process.env.NODE_ENV === 'production') {
 setip = 'http://118.89.19.201:8081'
}else{
 setip = 'http://localhost:8200'
}
export const IP = setip
export const FLAG="APP_"
export const USERNAME = FLAG+'USERNAME' //用户名
export const SESSION_TOKEN = FLAG+'SESSION_TOKEN' //token
export const SESSION_EXPIRED = FLAG+'SESSION_EXPIRED' //session过期时间
export const ACCOUNT_STATE = FLAG+'ACCOUNT_STATE' //账户状态
export const TIMEOUT = 3000000;//超时时间
export const HTTP_FAIL = "与服务器通信失败，请检查手机网络"
export const DATA_INVALID = "无法识别服务器返回的数据包"
export const DAY = 86399500