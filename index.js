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

    // get room name from URL by parsing it from the
    // server handshake and parsing it using '.split'
    var ref_url = socket.handshake['headers']['referer'];
    var room_array = ref_url.split('/');
    // '.split'
    room = room_array[3];

    // join the room based on the URL
    socket.join(room);

    // object of rooms containing arrays of the users inside the room.
    rooms[room] = {"users" : []};

    
    // check the user list to see if the given username is already taken
    socket.on('check name', function(name) {
        // true == username is available
        // false == username is taken
        var available;
        var idx = rooms[room].users.indexOf(name);

        //  ATTEMPTING TO VALIDATE FOR 
        // DUPLICATE USER NAMES
        
        //console.log(rooms[room].users);
        // console.log(rooms[room].users);
        // console.log(name);
        // console.log(idx);

        if (name === '') {
            available = null;
        }
        // if the name is not inside the user list
        if(idx === -1) {
            available = true;
        }
        else if (idx >= 0) {
            available = false;
        }
        // send back the result after checking the room's users
        io.emit('check name result', available);
    });


    socket.on('join chat', function(name) {
        socket.username = name;
        socket.room = room;
        users[socket.id] = {"username" : socket.username, "room" : room};

        // push username to array for user list
        for(var key in users) {
            var obj = users[key];
            if (obj['room'] == socket.room) {
                rooms[socket.room].users.push(obj['username']);
            }
        }

        // tell everybody in the room you've arrived.
        io.to(room).emit('get message', socket.username + ' has joined the chat.');
        io.to(room).emit('update users', rooms[room].users);
        console.log(rooms[room].users);
    });


    socket.on('disconnect', function() {        
        // get the index of the username inside the Rooms object
        var idx = rooms[room].users.indexOf(socket.username);
        
        // if the object is not found (index of -1) don't do anything,
        // otherwise delete the user from the rooms object as well as the users object.
        if(idx != -1) {
            io.to(room).emit('get message', socket.username + ' has left the chat.');
            rooms[room].users.splice(idx, 1);
            delete users[socket.id];
            io.to(room).emit('update users', rooms[room].users);
        }
    });

    socket.on('send message', function(msg) {
        // '.emit' sends the input to everybody (including sender!)
        io.to(room).emit('get message', socket.username + ':   ' + msg);
    });
    
});