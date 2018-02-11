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
var maps = [
    [
        '                                ',
        '                                ',
        'X#x      T~~~~~~~~~~~~t      X#x',
        '         Xx          Xx         ',
        '         Xx          Xx         ',
        '      X##################x      ',
        '                                ',
        '                                ',
        '  X####x                X####x  ',
        '              X##x              ',
        '            X######x            ',
        'X###x     X##########x     X###x',
        '                                ',
        '                                ',
        '   X########x      X########x   ',
        '                                ',
        '                                ',
        'T~~~~t   T~~~~~~~~~~~~t   T~~~~t'
    ],
    [
        '                                ',
        '                                ',
        'X####x                    X####x',
        '                                ',
        '         T~~~~~~~~~~~~t         ',
        '                                ',
        '                                ',
        'T~~~~~~t      X##x      T~~~~~~t',
        '              X##x              ',
        '              X##x              ',
        '         X############x         ',
        'T~~t         X####x         T~~t',
        '                                ',
        '                                ',
        'T~~~~~~t      X##x      T~~~~~~t',
        '               Xx               ',
        '               Xx               ',
        'T~~~~~~~~~~~~~tXxT~~~~~~~~~~~~~t'
    ]
];
var rand = Math.floor(Math.random() * maps.length);

console.log(maps[rand]);

io.on('connection', (socket) => {
    var newRole = undefined;
    var initData = {
        stageWidth: 1920,
        stageHeight: 1080,
        stageColor: '#e8e8e8',
        interval: 17,
        transferCoef: 16,
        blockThickness: 60,
        map: maps[rand]
    }

    socket.emit('init', JSON.stringify(initData));
    socket.on('my other event', (data) => {
        console.log(JSON.parse(data));
    });

    socket.on('loaded', (data) => {
        if (newRole) return;
        newRole = {
            id: socket.id,
            random: Math.floor(Math.random() * JSON.parse(data).floorNum),
            type: 0,
            color: '#66ccff'
        }
        Roles.push(newRole);
        var allRoles = {
            allRoles: Roles
        }
        socket.emit('createRole', JSON.stringify(allRoles));
        socket.broadcast.emit('addRole', JSON.stringify(newRole));

        ++playerNum;
        console.log('There are ' + playerNum + ' players');
    });

    socket.on('to jump', (data) => {
        socket.broadcast.emit('jump', data);
    });

    socket.on('to squat', (data) => {
        socket.broadcast.emit('squat', data);
    });

    socket.on('to stand', (data) => {
        socket.broadcast.emit('stand', data);
    });

    socket.on('to fall', (data) => {
        socket.broadcast.emit('fall', data);
    });

    socket.on('to move', (data) => {
        socket.broadcast.emit('move', data);
    });

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