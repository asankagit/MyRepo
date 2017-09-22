/*var app = require('express')();
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
});*/




'use strict';

var nodestatic = require('node-static');
var express = require('express');
var path = require('path');

const PORT = process.env.PORT || 3000;

var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 8080
var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || 'localhost'
var socketIoServer = '127.0.0.1';

var app = express();
//require('./router')(app, socketIoServer);

// Static content (css, js, .png, etc) is placed in /public
app.use(express.static(__dirname + '/public'));

// Location of our views
//app.set('views',__dirname + '/views');

// Use ejs as our rendering engine
//app.set('view engine', 'ejs');

// Tell Server that we are actually rendering HTML files through EJS.
//app.engine('html', require('ejs').renderFile);
var server=app.listen(serverPort, serverIpAddress, function(){
    console.log("Express is running on port "+serverPort);
});

var io = require('socket.io').listen(server);

var handleClient = function (socket) {
    // we've got a client connection
    socket.emit("tweet", {user: "nodesource", text: "Welcome!"});
};

io.on("connection", handleClient);


io.sockets.on('connection', function (socket){

    function log(){
        var array = [">>> Message from server: "];

////////////////////////////////////////////////
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }

    socket.on('message', function (message) {
        log('Got message: ', message);
        socket.broadcast.to(socket.room).emit('message', message);
    });

    socket.on('create or join', function (message) {
        var room = message.room;
        socket.room = room;
        var participantID = message.from;
        configNameSpaceChannel(participantID);

        var numClients = io.sockets.clients(room).length;

        log('Room ' + room + ' has ' + numClients + ' client(s)');
        log('Request to create or join room', room);

        if (numClients == 0){
            socket.join(room);
            socket.emit('created', room);
        } else {
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        }
    });

    // Setup a communication channel (namespace) to communicate with a given participant (participantID)
    function configNameSpaceChannel(participantID) {
        var socketNamespace = io.of('/'+participantID);

        socketNamespace.on('connection', function (socket){
            socket.on('message', function (message) {
                // Send message to everyone BUT sender
                socket.broadcast.emit('message', message);
            });
        });
    }

});

server.listen(PORT);

