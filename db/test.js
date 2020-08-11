/*
* 测试数据库
* */
const md5 = require('blueimp-md5')
const mongoose = require('mongoose')

// 首先定义一个用户身份信息的约束文档结构Schema
const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  type: { type: String, required: true },
  avatar: { type: String }

})

// 再定义一个用于操作集合的Model，其本质为构造函数
const UserModel = mongoose.model('users', userSchema)


// 连接数据库
mongoose.connect('mongodb://localhost:27017/test',
  { useNewUrlParser: true, useUnifiedTopology: true }
)

const mongooseConnection = mongoose.connection

mongooseConnection.on('connected', function () {
  console.log('Mongo数据库连接成功')
})

// 测试保存数据
function saveTest () {
  const userModel = new UserModel({
    username: 'test',
    password: md5('654321'),
    type: 'jobSeeker'
  })
  userModel.save((err, userDoc) => {
    if (err) {
      console.log(err)
    } else {
      console.log(userDoc)
    }

  })
}

// saveTest()

// 测试查询数据，一个或多个
function findTest () {
  UserModel.find((err, usersDocArr) => {
    if (err) {
      console.log(err)
    } else {
      console.log(usersDocArr)
    }
  })
  UserModel.findOne({ _id: '5f329d9fb913dd12e4d67a0a' },
    (err, userDoc) => {
      if (err) {
        console.log(err)
      } else {
        console.log(userDoc)
      }
    })
}

//findTest()

function updateTest () {
  UserModel.findByIdAndUpdate(
    {_id: '5f329d9fb913dd12e4d67a0a'},
    {username: 'test-update'},
    {useFindAndModify:false},
    (err,oldUserDoc) => {
      if (err) {
        console.log(err)
      } else {
        console.log(oldUserDoc)
      }
    })

}
// updateTest()

function deleteTest () {
  UserModel.deleteOne(
    {_id: '5f329d9fb913dd12e4d67a0a'},
    (err,delInfo) =>{
      if (err) {
        console.log(err)
      } else {
        console.log(delInfo)
      }
    })
}

// deleteTest()
