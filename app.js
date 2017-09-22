var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('A user connected');
  //Send a message when 
  setTimeout(function(){
	  //Sending an object when emmiting an event
	socket.send('testerEvent', { description: 'A custom event named testerEvent!'});
	}, 4000);
  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });
});
const PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
  console.log('listening on localhost:'+PORT);
});
