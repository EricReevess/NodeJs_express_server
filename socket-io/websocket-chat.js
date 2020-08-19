const { ChatModel } = require('../db/models')

module.exports = (server) => {
  const io = require('socket.io')(server)
  //io对象监听连接，每有一个连接建立，即创建一个socket
  io.on('connection', socket => {
    console.log('client connected')

    socket.on('clientMsg', ({ from_id, to_id, content }) => {
      console.log('收到客户端:', from_id, '的消息')
      // 保存客户端消息到数据库
      const chat_id = [from_id, to_id].sort().join('_')
      const create_time = Date.now()
      new ChatModel({ from_id, to_id, content, chat_id, create_time })
        .save((err, chatMsg) => {
          socket.emit('serverMsg', chatMsg)
          let toSocketId = getSocketIdFromCookie(to_id, io)
          console.log(toSocketId)
          // 如果对方socketId存在，则说明对方在线
          if (toSocketId) {
            io.sockets.connected[toSocketId].emit('serverMsg', chatMsg)
            console.log('向客户端', from_id, '发送消息')
          }
        })
    })


  })

}

// 通过消息接受者的用户id 获取对应的socketId
const getSocketIdFromCookie = (to_id, io) => {
  const connectedClient = io.sockets.connected
  for (let key in connectedClient) {
    if (connectedClient[key].handshake.headers.cookie) {
      console.log(connectedClient[key].handshake.headers.cookie)
      const cookies = connectedClient[key].handshake.headers.cookie
        .match(/userId=\w*;/).
        toString().
        replace(/userId=|;/g,'')
      if (cookies === to_id) {
        return connectedClient[key].id
      }
    }
  }
  return false
}


