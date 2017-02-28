验证码因为 windows 的 nodejs 不好处理图形，留到 linux 环境处理

数据结构

```js
单词列表
{
    id,
    word,
    describe,
    end_time,
    user
}

Token 库
｛
token,
verify_code,
create_time, 
expire_time, //过期时间
is_verify //登录成功后设为 true
｝

登录库
｛
username,
password,
uid
｝

```