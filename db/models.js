/*
* 数据库操作层，包含多个操作数据的Model对象*/
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/test',
  { useNewUrlParser: true, useUnifiedTopology: true })

const mongooseConnection = mongoose.connection

mongooseConnection.on('connected', () => {
  console.log('数据库连接成功！！')
})

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  avatar: { type: String },
  position: { type: String },
  personalInfo: { type: String },
  company: { type: String },
  salary: { type: String }
})

const UserModel = mongoose.model('users', userSchema)

// 暴露UserModel
exports.UserModel = UserModel
