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
        '###      ##~~~~~~~~~~##      ###',
        '         ##          ##         ',
        '         ##          ##         ',
        '      ####################      ',
        '                                ',
        '                                ',
        '  ######                ######  ',
        '              ####              ',
        '            ########            ',
        '#####     ############     #####',
        '                                ',
        '                                ',
        '   ##########      ##########   ',
        '                                ',
        '                                ',
        '~~~~~~   ~~~~~~~~~~~~~~   ~~~~~~'
    ],
    [
        '                                ',
        '                                ',
        '######                    ######',
        '                                ',
        '         ~~~~~~~~~~~~~~         ',
        '                                ',
        '                                ',
        '~~~~~~~~      ####      ~~~~~~~~',
        '              ####              ',
        '              ####              ',
        '         ##############         ',
        '~~~~         ######         ~~~~',
        '                                ',
        '                                ',
        '~~~~~~~~      ####      ~~~~~~~~',
        '              ####               ',
        '              ####               ',
        '~~~~~~~~~~~~~~~##~~~~~~~~~~~~~~~'
    ]
];
var roleType = [{
    width: 20,
    height: 60,
    weight: 1,
    power: 24,
    moveSpeed: 6
}];
var rand = Math.floor(Math.random() * maps.length);
var roomMap = maps[rand];
console.log(roomMap);

io.on('connection', (socket) => {
    // setInterval(() => {
    //     console.log(Roles[socket.id].x, Roles[socket.id].y);
    // }, 3000);
    var newRole = undefined;
    var typeRand = Math.floor(Math.random() * roleType.length);
    var initData = {
        stageWidth: 1920,
        stageHeight: 1080,
        stageColor: '#e8e8e8',
        interval: 17,
        transferCoef: 16,
        blockThickness: 60,
        map: roomMap
    }

    const t1 = new Date().getTime();
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

    console.log(i + 1, j);

    socket.on('loaded', (data) => {
        if (newRole) return;
        
        const t3 = new Date().getTime();
        const t2 = JSON.parse(data).time;
        const time_diff = Math.abs((t1 + t2 - 2 * t3) / 2);
        console.log("C/S 时间差", time_diff);

        newRole = {
            id: socket.id,
            width: roleType[typeRand].width,
            height: roleType[typeRand].height,
            weight: roleType[typeRand].weight,
            power: roleType[typeRand].power,
            moveSpeed: roleType[typeRand].moveSpeed,
            color: '#66ccff',
            i: i + 1,
            j: j,
            x: j * initData.blockThickness,
            y: (i + 1) * initData.blockThickness - roleType[typeRand].height
        }
        Roles[socket.id] = newRole;
        var rolesData = {
            allRoles: Roles,
            selfId: socket.id
        }
        socket.emit('createRole', JSON.stringify(rolesData));
        socket.broadcast.emit('addRole', JSON.stringify(newRole));

        ++playerNum;
        console.log('There are ' + playerNum + ' players');
    });

    socket.on('to jump', (data) => {
        socket.broadcast.emit('jump', data);
        var info = JSON.parse(data);
    });

    socket.on('to squat', (data) => {
        socket.broadcast.emit('squat', data);
    });

    socket.on('to stand', (data) => {
        socket.broadcast.emit('stand', data);
    });

    socket.on('to go down', (data) => {
        socket.broadcast.emit('go down', data);
    });

    socket.on('to move', (data) => {
        socket.broadcast.emit('move', data);
        var info = JSON.parse(data);
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