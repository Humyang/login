var isEmpty = function(val){
    if( val === undefined ||
        val === "" ||
        val === null){
        return true
    }
    return false
}
var loginVerify = function(username,password){
    if(isEmpty(username) || isEmpty(password)){
        return false
    }
    return true
}
module.exports = {
    loginVerify
}       