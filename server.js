var express = require("express"),
	http = require("http"),
	app = express(),
	server = http.createServer(app),
	io = require("socket.io").listen(server),
	users = [];
	app.use('/',express.static(__dirname+'/public'));
server.listen(8082);
console.log("server start");

io.on('connection',function(socket){
	socket.on('login',function(data){
		if (users.indexOf(data) > -1) {
            socket.emit('hased');
        } else {
            socket.userIndex = users.length;
            socket.nickname = data;
            users.push(data);
            socket.emit('success');
            io.sockets.emit('system', data,users.length,'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };	
	});
	//断开连接的事件
	socket.on('disconnect', function() {
		if(socket.nickname){
			users.splice(socket.userIndex, 1);
	    	//通知除自己以外的所有人
	    	socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
		}
	});
	socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    socket.on('img', function(imgData) {
	    //通过一个newImg事件分发到除自己外的每个用户
	    socket.broadcast.emit('newImg', socket.nickname, imgData);
	});
});

