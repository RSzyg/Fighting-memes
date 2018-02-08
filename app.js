var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 2333;

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Routing
app.use(express.static(__dirname + '/dist'));

// main
var Roles = [];

io.on('connection', (socket) => {
    var newRole = undefined;

    var Hello = {
        hello: "world"
    }
    socket.emit('news', JSON.stringify(Hello));
    socket.on('my other event', (data) => {
        console.log(JSON.parse(data));
    });

    socket.on('loaded', () => {
        if (newRole) return;
        newRole = {
            id: socket.id,
            random: Math.floor(Math.random() * 6),
            type: 0,
            color: '#66ccff'
        }
        Roles.push(newRole);
        var data = {
            allRoles: Roles
        }
        socket.emit('createRole', JSON.stringify(data));
        socket.broadcast.emit('addRole', JSON.stringify(newRole));
    });
});