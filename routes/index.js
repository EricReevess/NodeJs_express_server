const express = require('express')
const router = express.Router()
const { UserModel, ChatModel } = require('../db/models')
const md5 = require('blueimp-md5')
const filter = { password: 0, __v: 0 } //过滤器特定语法


/*
用户注册接口
 路径：/register
 请求方式：POST
 接收参数：username password type,administrator为管理员用户名
 注册成功：返回{code:0,data:{ _id:'xxx', username:'xxx'}}
 注册失败：返回{code:1,msg: '用户名已存在，或不可使用'}
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
            res.cookie('userId', userDoc._id.toString(), { maxAge: 3600000 * 24 })
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
    filter, // 设置过滤器后，userDoc中将不包含password _v0
    (err, userDoc) => {
      if (userDoc) {
        // 登陆成功
        res.cookie('userId', userDoc._id.toString(), { maxAge: 3600000 * 24 })
        res.send({
          code: 0,
          data: userDoc
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


/*
用户信息更新接口
 路径：/update-user-data
 请求方式：POST
 接收参数：
    name
    avatar // 头像
    position // 职位信息
    personalInfo // 个人信息、职位要求
    companyInfo
    salary
 登陆成功：返回{code:0,data:userDoc}
 登陆失败：返回{code:1,msg:'用户名或密码错误'}
*/

router.post('/update-user-data', (req, res) => {
  // 先冲请求体中判断是否有cookie，如果没有，说明既没有通过注册也没有通过登 录，且返回信息
  let userId = req.cookies.userId
  if (!userId) {
    return res.send({
      code: 1,
      msg: '请先登陆或者注册'
    })
  }
  const user = req.body
  UserModel.findByIdAndUpdate(
    { _id: userId },
    user,
    { useFindAndModify: true },
    (err, oldUserDoc) => {
      // 如果找不到之前的用户数据，通知浏览器删除cookie
      if (!oldUserDoc) {
        res.clearCookie('userId')
          .send({
            code: 1,
            msg: '用户信息不存在，请先注册'
          })
      } else {
        const { _id, username, userType } = oldUserDoc
        res.send({
          code: 0,
          data: Object.assign({ _id, username, userType }, user)
        })
      }
    })

})

/*
获取用户信息接口（自动登录）
  路径：/get-user-data
  请求方式：GET
  接收参数：
    userId cookie中的userId
  找不到userId 对应的用户信息，返回：{code:1,msg:'请先登录'}
  找到了userId对应的用户信息，返回：{code:0,data:userDoc}
*/

router.get('/get-user-data', (req, res) => {
  let userId = req.cookies.userId
  if (!userId) {
    return res.send({
      code: 1,
      msg: '请先登陆'
    })
  } else {
    UserModel.findOne({ _id: userId }, filter, function (err, userDoc) {
      if (userDoc) {
        res.send({
          code: 0,
          data: userDoc
        })
      } else {
        res.send({
          code: 1,
          msg: '用户信息有误，请重新登陆'
        })
      }
    })
  }
})

/*
获取用户列表
  路径：/get-user-list
  请求方式：GET
  接收参数：
    userType
  没有信息返回，返回：{code:1,msg:'当前无内容'}
  寻找到信息，返回：{code:0,data:usersDoc}
*/

router.get('/get-user-list', (req, res) => {
  const { userType } = req.query
  if (!userType) {
    return res.send({
      code: 1,
      msg: '参数错误'
    })
  } else {
    UserModel.find({ userType: userType }, filter, function (err, userDocs) {
      if (userDocs) {
        res.send({
          code: 0,
          data: userDocs
        })
      } else {
        res.send({
          code: 1,
          msg: '当前无内容'
        })
      }
    })
  }
})

/*
* 聊天功能接口*/

/*
* 获取当前用户所有聊天信息列表
* 路径：/get-msg-list
* 请求方式：GET
* 接收参数：无
* 响应信息包含：
* 所有用户的id，姓名以及头像信息，因为不能确定向某个用户发送信息，使用用户的id作为对象属性名
* 当前用户与某个用户的聊天信息数据结构,chatMessages 为数组类型
* */
router.get('/get-msg-list', (req, res) => {
  const userId = req.cookies.userId
  // 获取所有用户的部分信息
  UserModel.find((err, userDocs) => {
    /*  const users = {}
        userDocs.forEach(user => {
          users[user._id] = {
            name: user.name,
            avatar: user.avatar
        }*/
    // 归并写法
    const users = userDocs.reduce((users, user) => {
      users[user._id] = {
        name: user.name,
        avatar: user.avatar
      }
      return users
    }, {})


    ChatModel.find({ '$or': [{ from_id: userId }, { to_id: userId }] },
      filter,
      (err, chatMessages) => {
        res.send({
          code: 0,
          data: { users, chatMessages }
        })
      })
  })
})

/*
* 修改指定消息为已读
* * 路径：/has-read-msg
* 请求方式：POST
* 接收参数：
*   from_id 当前消息列表中对方的id
* 在点击未读消息时，客户端向服务器发起当前请求，修改
* */
router.post('/has-read-msg', (req, res) => {
  const { from_id } = req.body
  const to_id = req.cookies.userId

  ChatModel.update(
    { from_id, to_id, hasRead: false },
    { hasRead: true },
    { multi: true },
    (err, msgDoc) => {
      res.send({
        code: 0,
        data: msgDoc.nModified // .nMatched返回修改的条目总数
      })
    })
})

module.exports = router
