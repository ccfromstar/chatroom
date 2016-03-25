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
	})
});

