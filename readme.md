```
npm install koa-flogin

```

usage:


```
var app = require('koa')()
var body = require('koa-better-body')
var router = require('koa-router')()
var LOGIN = require('./module/login.js')
router.post('/login_status_check',LOGIN.login_check(),function *(next){
    this.body = {
        status:true,
        msg:'登录中'
    }
})
```


```js

登录库
｛
username,
password,
uid
｝

```