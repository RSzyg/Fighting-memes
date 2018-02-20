var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 2333;

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../index.html'));
});

// Routing
app.use(express.static(path.resolve(__dirname, '../dist/')));

// main
var Roles = {};
var playerNum = 0;

// 32 * 18
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
        '              X##x               ',
        '              X##x               ',
        'T~~~~~~~~~~~~~tXxT~~~~~~~~~~~~~t'
    ]
];
var rand = Math.floor(Math.random() * maps.length);
var roomMap = maps[rand];
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
        map: roomMap
    }

    socket.emit('init', JSON.stringify(initData));

    var i = Math.floor(Math.random() * 17);
    var j = Math.floor(Math.random() * 32);
    while (roomMap[i][j] !== ' ' || roomMap[i + 1][j] === ' ') {
        var direct = Math.floor(Math.random() * 4);
        if (direct === 0 || direct === 2) {
            i = Math.floor(Math.random() * 17);
        } else {
            j = Math.floor(Math.random() * 32);
        }
    }

    console.log(i, j);

    socket.on('loaded', () => {
        if (newRole) return;

        newRole = {
            id: socket.id,
            type: 0,
            color: '#66ccff',
            x: j * initData.blockThickness,
            y: i * initData.blockThickness
        }
        Roles[socket.id] = newRole;
        var allRoles = {
            allRoles: Roles,
            selfId: socket.id
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
            delete Roles[socket.id];
            socket.broadcast.emit('player left', JSON.stringify(data));
            --playerNum;
            console.log('There are ' + playerNum + ' players');
        }
    });
});