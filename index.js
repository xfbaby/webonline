
var express = require('express')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
// 提供静态文件服务
// 在线用户
var onlineUsers = {}
// 当前在线人数
var onlineCount = 0
app.use(express.static(__dirname))
io.on('connection', function (socket) {
//   socket.on('message', function (data) {
//     // 服务端像所以也没发送数据
//     io.sockets.emit('message', data.message)
//   })
  socket.on('login', function (obj) {
    // 将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
    socket.name = obj.userid
    // 检查在线列表，如果不在里面就加入
    if (!onlineUsers.hasOwnProperty(obj.userid)) {
      onlineUsers[obj.userid] = obj.username
      // 在线人数+1
      onlineCount++
    }

    // 向所有客户端广播用户加入
    io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj })
    console.log(obj.username + '加入了聊天室')
  })

  // 监听用户退出
  socket.on('disconnect', function () {
    // 将退出的用户从在线列表中删除
    if (onlineUsers.hasOwnProperty(socket.name)) {
      // 退出用户的信息
      var obj = { userid: socket.name, username: onlineUsers[socket.name] }

      // 删除
      delete onlineUsers[socket.name]
      // 在线人数-1
      onlineCount--

      // 向所有客户端广播用户退出
      io.emit('logout', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj })
      console.log(obj.username + '退出了聊天室')
    }
  })
  // 监听用户发布聊天内容
  socket.on('message', function (obj) {
    // 向所有客户端广播发布的消息
    io.sockets.emit('message', obj)
    console.log(obj.username + '说：' + obj.content)
  })
  socket.broadcast.emit('message', '你的好某XXX上线了')
  // 接收用户发来的图片
  socket.on('img', function (imgData) {
    // 通过一个newImg事件分发到除自己外的每个用户
    socket.broadcast.emit('img', imgData)
  })
})

server.listen(3000, function () {
  console.log('连接成功')
})
