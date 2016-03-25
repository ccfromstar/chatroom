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

		document.getElementById('loginBtn').addEventListener('click', function() {
			var nickName = document.getElementById('nicknameInput').value;
			if (nickName.trim().length != 0) {
				that.socket.emit('login', nickName);
			} else {
				document.getElementById('nicknameInput').focus();
			};
		}, false);

		this.socket.on('hased', function() {
			document.getElementById('info').textContent = '昵称被占用';
		});

		this.socket.on('success', function() {
			document.title = 'chatroom | ' + document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper').style.display = 'none'; //隐藏遮罩层显聊天界面
			document.getElementById('messageInput').focus(); //让消息输入框获得焦点
		});
	}
};