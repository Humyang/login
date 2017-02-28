function throwError(obj,msg){
    let nObj = {
        STATUSCODE:obj.STATUSCODE,
        MSG:obj.MSG
    }
    if(msg != undefined){
        nObj.MSG = nObj.MSG + msg
    }
    throw new Error(JSON.stringify(nObj))
}
module.exports = {
    throwError
}