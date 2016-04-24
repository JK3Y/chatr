/**
 * Created by jamador on 4/15/16.
 */
var express = require('express');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var users = {};
var rooms = {};


app.use(express.static('bower_components'));
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/chat.html');
});

http.listen(process.env.PORT || 3000, function() {
    console.log('Server is listening on port %d in %s mode.', this.address().port, app.settings.env);
});


io.on('connection', function(socket) {

    //get room name from URL by parsing it from the
    // server handshake and parsing it using '.split'
    var ref_url = socket.handshake['headers']['referer'];
    var room_array = ref_url.split('/');
    room = room_array[3];

    // join the room based on the URL
    socket.join(room);

    // object of rooms containing arrays of the users inside the room.
    rooms[room] = {"users" : []};



    socket.on('join chat', function(name) {
        socket.username = name;
        socket.room = room;
        console.log(socket.username + ' connected');
        users[socket.id] = {"username" : socket.username, "room" : room};

        //push username to array for user list
        for(var key in users) {
            var obj = users[key];
            if (obj['room'] == socket.room) {
                rooms[socket.room].users.push(obj['username']);
            }
        }

        // tell everybody in the room you've arrived.
        io.to(room).emit('get message', socket.username + ' has joined the chat.');
        io.to(room).emit('update users', rooms[room].users);
    });


    socket.on('disconnect', function() {
        //console.log(users[socket.id].username + ' disconnected');
        io.to(room).emit('get message', socket.username + ' has left the chat.');
        //delete users[socket.id];
        //rooms[room].users.splice(un, 1);
        
        idx = rooms[room].users.indexOf(socket.username);
        if(idx != -1) {
            rooms[room].users.splice(idx, 1);
        }

        console.log(rooms[room].users);
        io.to(room).emit('update users', rooms[room].users);
    });

    socket.on('send message', function(msg) {
        console.log(socket.username + ':   ' + msg);
        // '.emit' sends the input to everybody (including sender!)
        io.to(room).emit('get message', socket.username + ':   ' + msg);
    });
    
});