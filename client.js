var that = this;
(function () {
  var d = document
  var w = window
  var p = parseInt
  var dd = d.documentElement
  var db = d.body
  var dc = d.compatMode === 'CSS1Compat'

  var dx = dc ? dd : db

  var ec = encodeURIComponent

  w.CHAT = {
    msgObj: d.getElementById('message'),
    screenheight: 0,
    username: null,
    userid: null,
    socket: null,
    // 让浏览器滚动条保持在最低部
    scrollToBottom: function () {
      w.scrollTo(0, this.msgObj.clientHeight)
    },
    // 退出，本例只是一个简单的刷新
    logout: function () {
      this.socket.disconnect()
      location.reload()
    },
    // 提交聊天消息内容
    submit: function () {
      var content = d.getElementById('content').value
      if (content != '') {
        var obj = {
          userid: this.userid,
          username: this.username,
          content: content,
          userpic: d.getElementById('defaultHead').getAttribute('src')
        }
        this.socket.emit('message', obj)
        d.getElementById('content').value = ''
      }
      return false
    },
    genUid: function () {
      return new Date().getTime() + '' + Math.floor(Math.random() * 899 + 100)
    },
    // 更新系统消息，本例中在用户加入、退出的时候调用
    updateSysMsg: function (o, action) {
      console.log(o, 111111111111)
      // 当前在线用户列表
      var onlineUsers = o.onlineUsers
      // 当前在线人数
      var onlineCount = o.onlineCount
      // 新加入用户的信息
      var user = o.user

      // 更新在线人数
      var userhtml = ''
      var separator = ''
      for (key in onlineUsers) {
        if (onlineUsers.hasOwnProperty(key)) {
          userhtml += separator + onlineUsers[key]
          separator = '、'
        }
      }
      d.getElementById('onlinecount').innerHTML = '当前共有 ' + onlineCount + ' 人在线，在线列表：' + userhtml

      // 添加系统消息
      var html = ''
      html += '<div class="msg-system">'
      html += user.username
      html += (action === 'login') ? ' 加入了聊天室' : ' 退出了聊天室'
      html += '</div>'
      var section = d.createElement('section')
      section.className = 'system J-mjrlinkWrap J-cutMsg'
      section.innerHTML = html
      this.msgObj.appendChild(section)
      this.scrollToBottom()
    },
    // 第一个界面用户提交用户名
    usernameSubmit: function () {
      var username = d.getElementById('username').value
      var userpic = d.getElementById('defaultHead').src
      if (username != '') {
        d.getElementById('username').value = ''
        d.getElementById('loginbox').style.display = 'none'
        d.getElementById('chatbox').style.display = 'block'
        this.init(username, userpic)
      }
      return false
    },
    _displayImage: function (user, imgData, color) {
      var container = document.getElementById('historyMsg')
      var msgToDisplay = document.createElement('p')
      var date = new Date().toTimeString().substr(0, 8)
      msgToDisplay.style.color = color || '#000'
      msgToDisplay.innerHTML = '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>'
      container.appendChild(msgToDisplay)
      // container.scrollTop = container.scrollHeight
    },
    _initialEmoji: function () {
      // var emojiContainer = document.getElementById('emojiWrapper')
      // var docFragment = document.createDocumentFragment()
      // for (var i = 1; i > 0; i--) {
      //   var emojiItem = document.createElement('img')
      //   emojiItem.src = '../content/emoji/' + i + '.gif'
      //   emojiItem.title = i
      //   docFragment.appendChild(emojiItem)
      // };
      // emojiContainer.appendChild(docFragment)
    },

    init: function (username, userpic) {
      /*
        客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
       */
      this.userid = this.genUid()
      this.username = username
      this.userpic = userpic
      d.getElementById('showusername').innerHTML = this.username
      this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + 'px'
      this.scrollToBottom()

      // 连接websocket后端服务器
      this.socket = io.connect('http://localhost:3000')
      that = this.socket

      // 告诉服务器端有用户登录
      this.socket.emit('login', { userid: this.userid, username: this.username, userpic: this.userpic })

      // 监听新用户登录
      this.socket.on('login', function (o) {
        CHAT.updateSysMsg(o, 'login')
      })

      // 监听用户退出
      this.socket.on('logout', function (o) {
        CHAT.updateSysMsg(o, 'logout')
      })

      // 监听消息发送
      this.socket.on('message', function (obj) {
        if (typeof obj === 'string') return
        var date = new Date().toTimeString().substr(0, 8)
        var isme = (obj.userid == CHAT.userid)
        console.log(isme, 33333333)
        var em = obj.content ? obj.content.match(/\[emoji\:[0-9]\]/g) : null
        var index = em ? em[0].match(/[0-9]/g) : -1
        var contentDiv = '<div class="content comment">' + obj.content + '</div>'
        var tempImg = index !== -1 ? '<img class="emoji" src="../content/emoji/' + index + '.gif" /> ' : ''
        var usernameDiv = '<span class="name">' + '<img class="photo" src="' + obj.userpic + '"/>' + tempImg + date + '</span>'
        var section = d.createElement('section')
        if (isme) {
          section.className = 'user'
          section.innerHTML = contentDiv + usernameDiv
        } else {
          section.className = 'service'
          section.innerHTML = usernameDiv + contentDiv
        }
        CHAT.msgObj.appendChild(section)
        CHAT.scrollToBottom()
      })
      this.socket.on('img', function (user, img) {
        CHAT._displayImage('user', img)
      })
    }
  }
  // 通过“回车”提交用户名
  d.getElementById('username').onkeydown = function (e) {
    e = e || event
    if (e.keyCode === 13) {
      CHAT.usernameSubmit()
    }
  }
  // 通过“回车”提交信息
  d.getElementById('content').onkeydown = function (e) {
    e = e || event
    if (e.keyCode === 13) {
      CHAT.submit()
    }
  }
  document.getElementById('emoji').addEventListener('click', function (e) {
    var emojiwrapper = document.getElementById('emojiWrapper')
    emojiwrapper.style.display = 'block'
    e.stopPropagation()
  }, false)
  document.body.addEventListener('click', function (e) {
    var emojiwrapper = document.getElementById('emojiWrapper')
    if (e.target != emojiwrapper) {
      emojiwrapper.style.display = 'none'
    };
  })
  document.getElementById('emojiWrapper').addEventListener('click', function (e) {
    // 获取被点击的表情
    var target = e.target
    console.log(target, 33333)
    if (target.nodeName.toLowerCase() == 'span') {
      var messageInput = document.getElementById('content')
      messageInput.focus()
      messageInput.value = messageInput.value + target.innerHTML
    };
  }, false)
  // 切换头像
  document.getElementById('head-btn').addEventListener('click', function (e) {
    var headportrait = document.getElementById('headportrait')
    if (headportrait.style.display != 'block') {
      headportrait.style.display = 'block'
    } else {
      headportrait.style.display = 'none'
    }
    e.stopPropagation()
  }, false)

  document.getElementById('headportrait').addEventListener('click', function (e) {
    var url = e.target.getAttribute('src')
    document.getElementById('defaultHead').setAttribute('src', url)
    var headportrait = document.getElementById('headportrait')
    headportrait.style.display = 'none'
  }, false)
  // 用户登录事件
  document.getElementById('click-to-login').addEventListener('click', function (e) {
    CHAT.usernameSubmit()
  }, false)
})()

var openFile = function (event) {
  var input = event.target

  var reader = new FileReader()
  if (!reader) {
    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red')
    this.value = ''
    return
  }
  reader.onload = function () {
    var dataURL = reader.result
    that.socket.emit('img', dataURL)
    // var output = document.getElementById('output')
    // output.src = dataURL
  }
  reader.readAsDataURL(input.files[0])
}
loadHeadPortrait()

/* 头像初始化 */
function loadHeadPortrait () {
  var headContainer = document.getElementById('headportrait')
  // 获取头像容器元素
  var headFragment = document.createDocumentFragment()			// 创建文档块
  for (let i = 1; i <= 5; i++) {
    var headItem = document.createElement('img')

    headItem.src = './content/head/' + i + '.jpg'

    headItem.num = i

    headFragment.appendChild(headItem)
  };
  headContainer.appendChild(headFragment)					// 统一导入头像容器
}

$.getJSON('./content/emoji/emojis.json', function (emojis) {
  var container = $('#emojiWrapper')
  Object.keys(emojis).forEach(function (key) {
    var emoji = emojis[key]
    if (emoji['category'] === '_custom') return

    var charHTML
    charHTML = '<span class="js-emoji-char native-emoji" title="' + key + '">' + emoji['char'] + '</span>'
    container.append(charHTML)
  })
  $(document).trigger('emoji:ready')
  $('.emojis-container').toggleClass('hide-text', localStorage.getItem('emoji-text-display') === 'false')
})
