const express = require('express')
const router = express.Router()
const { UserModel } = require('../db/models')
const md5 = require('blueimp-md5')
const filter = { password: 0 , __v: 0} //过滤器特定语法
/* GET home page. */


/*
用户注册接口
 路径：/register
 请求方式：POST
 接收参数：username password type,administrator为管理员用户名
 登陆成功：返回{code:0,data:{ _id:'xxx', username:'xxx'}}
 登陆失败：返回{code:1,msg: '用户名已存在，或不可使用'}
*/
router.post('/register', (req, res) => {
  // 获取参数
  const { username, password, userType } = req.body

  // 处理，判断用户是否存在

  if (/administrator/.test(username)) {
    // 注册失败
    res.send({
      code: 1, msg: '用户名已存在，或不可使用'
    })
  } else {
    UserModel.findOne({ username }, (err, userDoc) => {
      // 查找到了，注册失败
      if (userDoc) {
        res.send({
          code: 1, msg: '用户名已存在，或不可使用'
        })

      } else {
        new UserModel({
          userType,
          username,
          password: md5(password)
        })
          .save((err, userDoc) => {
            const data = {
              username,
              userType,
              _id: userDoc._id,
            }
            // 注册成功后自动登录需要cookie
            // 设置持久化cookie，此cookie存放于浏览器文件中，并设置过期时间为1天(ms为单位)
            res.cookie('userId', userDoc._id, { maxAge: 3600000 * 24 })
            res.send({ code: 0, data })
          })
      }
    })
  }
})

/*
用户登录接口
 路径：/login
 请求方式：GET
 接收参数：username password
 登陆成功：返回{code:0,data:userDoc}
 登陆失败：返回{code:1,msg:'用户名或密码错误'}
*/
router.post('/login', (req, res) => {
  const { username, password } = req.body
  UserModel.findOne(
    {
      username,
      password: md5(password)
    },
    filter, // 设置过滤器后，userDoc中将不包含password
    (err, userDoc) => {
      if (userDoc) {
        // 登陆成功
        res.cookie('userId', userDoc._id, { maxAge: 3600000 * 24 })
        res.send({
          code: 0,
          data:userDoc
        })
      } else {
        //登录失败
        res.send({
          code: 1,
          msg: '用户名或密码错误'
        })
      }
    })
})


module.exports = router
