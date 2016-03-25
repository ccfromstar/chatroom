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
			document.getElementById('info').textContent = '';
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
     		var msg = nickName + (type == 'login' ? '进入了聊天室' : '离开了聊天室');
     		/*
     		var p = document.createElement('p');
     		p.textContent = msg;
     		document.getElementById('historyMsg').appendChild(p);*/
     		that._displayNewMsg('系统消息', msg, 'alert-danger','infoframe_center');
     		//将在线人数显示到页面顶部
     		document.getElementById('status').textContent = '当前有' + userCount + '个用户在线';
 		});
		this.socket.on('newMsg', function(user, msg) {
		    that._displayNewMsg(user, msg);
		});
		this.socket.on('newImg', function(user, img) {
		    that._displayImage(user, img);
		});
		this.socket.on('newAudio', function(user, audio) {
		    that._displayAudio(user, audio);
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
		        that._displayNewMsg('我', msg, 'alert-success','infoframe_reverse'); //把自己的消息显示到自己的窗口中
		    };
		}, false);
		document.getElementById('sendImage').addEventListener('change', function() {
		    //检查是否有文件被选中
		    if (this.files.length != 0) {
		        //获取文件并用FileReader进行读取
		         var file = this.files[0],
		             reader = new FileReader();
		         if (!reader) {
		             that._displayNewMsg('系统消息', '对不起，您的浏览器不支持！', 'alert-danger','infoframe_center');
		             this.value = '';
		             return;
		         };
		         reader.onload = function(e) {
		            //读取成功，显示到页面并发送到服务器
		             this.value = '';
		             that.socket.emit('img', e.target.result);
		             that._displayImage('我', e.target.result,'alert-success','infoframe_reverse');
		         };
		         reader.readAsDataURL(file);
		    };
		}, false);
		document.getElementById('sendAudio').addEventListener('change', function() {
		    //检查是否有文件被选中
		    if (this.files.length != 0) {
		        //获取文件并用FileReader进行读取
		         var file = this.files[0],
		             reader = new FileReader();
		         if (!reader) {
		             that._displayNewMsg('系统消息', '对不起，您的浏览器不支持！', 'alert-danger','infoframe_center');
		             this.value = '';
		             return;
		         };
		         reader.onload = function(e) {
		            //读取成功，显示到页面并发送到服务器
		             this.value = '';
		             that.socket.emit('audio', e.target.result);
		             that._displayAudio('我', e.target.result,'alert-success','infoframe_reverse');
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
		document.getElementById('messageInput').addEventListener('keyup', function(e) {
	      	var messageInput = document.getElementById('messageInput'),
	          	msg = messageInput.value;
	      	if (e.keyCode == 13 && msg.trim().length != 0) {
	          	messageInput.value = '';
	          	that.socket.emit('postMsg', msg);
	          	that._displayNewMsg('我:', msg, 'alert-success','infoframe_reverse');
	    	};
	  	}, false);
	},
	_displayNewMsg: function(user, msg, color,direction) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            msg = this._showEmoji(msg);
        //msgToDisplay.style.color = color || '#000';
        var _color = color || 'alert-info';
        var _direction = direction || '';
        var msgHtml = '';
        if(user == '系统消息'){
        	msgHtml = '<div class="infoframe '+_direction+'"><div class="alert_info alert '+_color+'">'+user+'(' + date + ')'+msg+'</div></div>';
        }else{
        	msgHtml = '<div class="infoframe '+_direction+'">'+user+'<span class="timespan">(' + date + ')</span>';
        	msgHtml += '<div class="alert_info alert '+_color+'">'+msg+'</div></div>';
        }
        msgToDisplay.innerHTML = msgHtml;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData,color,direction) {
	    var container = document.getElementById('historyMsg'),
	        msgToDisplay = document.createElement('p'),
	        date = new Date().toTimeString().substr(0, 8);
	    //msgToDisplay.style.color = color || '#000';
	    var _color = color || 'alert-info';
	    var _direction = direction || '';
	    var msgHtml = '';
	    msgHtml = '<div class="infoframe '+_direction+'">'+user+'<span class="timespan">(' + date + ')</span>';
        msgHtml += '<div class="alert_info alert '+_color+'">'+'<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>'+'</div></div>';
	    msgToDisplay.innerHTML = msgHtml;
	    container.appendChild(msgToDisplay);
	    container.scrollTop = container.scrollHeight;
	},
	_displayAudio: function(user, audioData,color,direction) {
	    var container = document.getElementById('historyMsg'),
	        msgToDisplay = document.createElement('p'),
	        date = new Date().toTimeString().substr(0, 8);
	    //msgToDisplay.style.color = color || '#000';
	    var _color = color || 'alert-info';
	    var _direction = direction || '';
	    var msgHtml = '';
	    msgHtml = '<div class="infoframe '+_direction+'">'+user+'<span class="timespan">(' + date + ')</span>';
        msgHtml += '<div class="alert_info alert '+_color+'">'+'<audio src="'+audioData+'" controls autoplay></audio>'+'</div></div>';
	    msgToDisplay.innerHTML = msgHtml;
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