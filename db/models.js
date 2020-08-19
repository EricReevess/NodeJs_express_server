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
  name: { type: String },
  avatar: { type: String },
  position: { type: String }, // 职位信息
  personalInfo: { type: String }, // 个人信息、职位要求
  companyInfo: { type: String },
  salary: { type: String }
})

const chatSchema = mongoose.Schema({
  from_id: { type: String, required: true }, // 消息的发起者的用户id
  to_id: { type: String, required: true }, // 消息的接受者的用户id
  chat_id: { type: String, required: true }, // 消息的聊天室id
  content: { type: String, required: true },
  hasRead: { type: Boolean, default: false },
  create_time: { type: String },
})

const UserModel = mongoose.model('users', userSchema)
const ChatModel = mongoose.model('chats', chatSchema)

// 暴露UserModel
exports.UserModel = UserModel
exports.ChatModel = ChatModel
