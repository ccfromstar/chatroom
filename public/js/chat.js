window.onload = function() {
	var chat = new Chat();
	chat.init();
};

var Chat = function() {
	this.socket = null;
};

Chat.prototype = {
	init: function() {
		var that = this;
		//建立到服务器的socket连接
		this.socket = io.connect();
		//监听socket的connect事件，此事件表示连接已经建立
		this.socket.on('connect', function() {
			//连接到服务器后，显示昵称输入框
			document.getElementById('info').textContent = '您的昵称是：';
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nicknameInput').focus();
		});
		this.socket.on('hased', function() {
			document.getElementById('info').textContent = '昵称被占用';
		});

		this.socket.on('success', function() {
			document.title = 'chatroom | ' + document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper').style.display = 'none'; //隐藏遮罩层显聊天界面
			document.getElementById('messageInput').focus(); //让消息输入框获得焦点
		});
		this.socket.on('system', function(nickName, userCount, type) {
     		//判断用户是连接还是离开以显示不同的信息
     		var msg = nickName + (type == 'login' ? ' joined' : ' left');
     		/*
     		var p = document.createElement('p');
     		p.textContent = msg;
     		document.getElementById('historyMsg').appendChild(p);*/
     		that._displayNewMsg('system ', msg, 'red');
     		//将在线人数显示到页面顶部
     		document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
 		});
		this.socket.on('newMsg', function(user, msg) {
		    that._displayNewMsg(user, msg);
		});
		this.socket.on('newImg', function(user, img) {
		    that._displayImage(user, img);
		});

		document.getElementById('loginBtn').addEventListener('click', function() {
			var nickName = document.getElementById('nicknameInput').value;
			if (nickName.trim().length != 0) {
				that.socket.emit('login', nickName);
			} else {
				document.getElementById('nicknameInput').focus();
			};
		}, false);

 		document.getElementById('sendBtn').addEventListener('click', function() {
		    var messageInput = document.getElementById('messageInput'),
		        msg = messageInput.value;
		    messageInput.value = '';
		    messageInput.focus();
		    if (msg.trim().length != 0) {
		        that.socket.emit('postMsg', msg); //把消息发送到服务器
		        that._displayNewMsg('me', msg); //把自己的消息显示到自己的窗口中
		    };
		}, false);
		document.getElementById('sendImage').addEventListener('change', function() {
		    //检查是否有文件被选中
		    if (this.files.length != 0) {
		        //获取文件并用FileReader进行读取
		         var file = this.files[0],
		             reader = new FileReader();
		         if (!reader) {
		             that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
		             this.value = '';
		             return;
		         };
		         reader.onload = function(e) {
		            //读取成功，显示到页面并发送到服务器
		             this.value = '';
		             that.socket.emit('img', e.target.result);
		             that._displayImage('me', e.target.result);
		         };
		         reader.readAsDataURL(file);
		    };
		}, false);
		this._initialEmoji();
		document.getElementById('emoji').addEventListener('click', function(e) {
		     var emojiwrapper = document.getElementById('emojiWrapper');
		     emojiwrapper.style.display = 'block';
		     e.stopPropagation();
		}, false);
		document.body.addEventListener('click', function(e) {
		     var emojiwrapper = document.getElementById('emojiWrapper');
		     if (e.target != emojiwrapper) {
		         emojiwrapper.style.display = 'none';
		     };
		});
		document.getElementById('emojiWrapper').addEventListener('click', function(e) {
		    //获取被点击的表情
		    var target = e.target;
		    if (target.nodeName.toLowerCase() == 'img') {
		        var messageInput = document.getElementById('messageInput');
		        messageInput.focus();
		        messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
		    };
		}, false);
	},
	_displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
	    var container = document.getElementById('historyMsg'),
	        msgToDisplay = document.createElement('p'),
	        date = new Date().toTimeString().substr(0, 8);
	    msgToDisplay.style.color = color || '#000';
	    msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
	    container.appendChild(msgToDisplay);
	    container.scrollTop = container.scrollHeight;
	},
	_initialEmoji: function() {
	    var emojiContainer = document.getElementById('emojiWrapper'),
	        docFragment = document.createDocumentFragment();
	    for (var i = 69; i > 0; i--) {
	        var emojiItem = document.createElement('img');
	        emojiItem.src = '../content/emoji/' + i + '.gif';
	        emojiItem.title = i;
	        docFragment.appendChild(emojiItem);
	    };
	    emojiContainer.appendChild(docFragment);
	},
	_showEmoji: function(msg) {
	    var match, result = msg,
	        reg = /\[emoji:\d+\]/g,
	        emojiIndex,
	        totalEmojiNum = document.getElementById('emojiWrapper').children.length;
	    while (match = reg.exec(msg)) {
	        emojiIndex = match[0].slice(7, -1);
	        if (emojiIndex > totalEmojiNum) {
	            result = result.replace(match[0], '[X]');
	        } else {
	            result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
	        };
	    };
	    return result;
	}
};