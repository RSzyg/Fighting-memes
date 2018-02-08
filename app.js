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
var playerNum = 0;

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

        ++playerNum;
        console.log('There are ' + playerNum + ' players');
    });

    socket.on('to jump', (data) => {
        socket.broadcast.emit('jump', data);
    })
    
    socket.on('disconnect', () => {
        if (newRole) {
            var data = {
                id: socket.id
            }
            Roles.splice(Roles.indexOf(newRole), 1);
            socket.broadcast.emit('player left', JSON.stringify(data));
            --playerNum;
            console.log('There are ' + playerNum + ' players');
        }
    });
});