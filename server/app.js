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

    var impactJudge = function (nextWidth, isRight, id) {
        if (Roles[id]) {
            var i1 = Math.floor(Roles[id].y / initData.blockThickness);
            var i2 = Math.floor((Roles[id].y + Roles[id].height) / initData.blockThickness);
            var j1 = Math.floor(Roles[id].x / initData.blockThickness);
            var j2 = Math.floor((Roles[id].x + nextWidth) / initData.blockThickness);

            j1 = (j1 + roomMap[0].length) % roomMap[0].length;
            j2 = (j2 + roomMap[0].length) % roomMap[0].length;

            var j = isRight ? j2 : j1;

            for (var i = i1; i <= i2; i++) {
                if (roomMap[i] === undefined) {
                    break;
                }
                if (
                    (
                        roomMap[i][j] !== "~" &&
                        roomMap[i][j] !== " "
                    )
                ) {
                    if (
                        (Roles[id].y + Roles[id].height) !== i * initData.blockThickness &&
                        j1 === j2 - 1
                    ) {
                        Roles[id].x = j2 * initData.blockThickness - isRight * nextWidth;
                    }
                }
            }
            Roles[id].x = (Roles[id].x + initData.stageWidth) % initData.stageWidth;
        }
    }

    var fallJudge = function (id) {
        if (Roles[id]) {
            var x = Roles[id].x;
            var i = Math.floor((Roles[id].y + Roles[id].height) / initData.blockThickness);
            var j1 = Math.floor(x / initData.blockThickness);
            x += Roles[id].width;
            var j2 = Math.floor(x / initData.blockThickness);
            if (roomMap[i] === undefined) {
                return;
            }
            if (roomMap[i][j1] === " " && roomMap[i][j1] === roomMap[i][j2]) {
                if (!Roles[id].verticalTimer) {
                    console.log("fall true");
                    Roles[id].i %= roomMap.length;
                    Roles[id].jumpSpeed = 0;
                    Roles[id].verticalTimer = setInterval(
                        () => verticalMove(id),
                        initData.interval
                    );
                }
            }
        }
    }

    var goDown = function (id) {
        if (Roles[id]) {
            var x = Roles[id].x;
            // under foot block
            var i = Roles[id].i + 1;
            // left block
            var j1 = Math.floor(x / initData.blockThickness);
            // right block
            x += Roles[id].width;
            var j2 = Math.floor(x / initData.blockThickness);

            if (
                roomMap[i] === undefined ||
                (
                    roomMap[i][j1] === " " &&
                    roomMap[i][j1] === roomMap[i][j2]
                )
            ) {
                console.log("go down true", i);
                Roles[id].i %= roomMap.length;
                Roles[id].jumpSpeed = 0;
                Roles[id].verticalTimer = setInterval(
                    () => verticalMove(id),
                    initData.interval,
                );
            }
        }
    }

    var squatTreat = function (id, isDown) {
        if (Roles[id]) {
            var transferCoef = (2 * Number(isDown) - 1) * initData.transferCoef;
            Roles[id].height -= transferCoef;
            Roles[id].y += transferCoef;
            var nextWidth = Roles[id].width + transferCoef;
            impactJudge(nextWidth, 1, id);
            Roles[id].width = nextWidth;
        }
    }

    var verticalMove = function(id) {
        console.log("111111", Roles[id].jumpSpeed);
        var i;
        var nextY = Roles[id].y - Roles[id].jumpSpeed;
        var x = Roles[id].x;
        Roles[id].jumpSpeed -= Roles[id].weight;
        nextY = (nextY + initData.stageHeight) % initData.stageHeight;
        if (Roles[id].jumpSpeed > 0) {
            i = Math.floor(nextY / initData.blockThickness);
            const j1 = Math.floor(x / initData.blockThickness);
            x += Roles[id].width;
            const j2 = Math.floor(x / initData.blockThickness);

            if (roomMap[i]) {
                if (
                    (roomMap[i][j1] !== " " &&
                        roomMap[i][j1] !== "~") ||
                    (x !== j2 * initData.blockThickness &&
                        roomMap[i][j2] !== undefined &&
                        roomMap[i][j2] !== " " &&
                        roomMap[i][j2] !== "~")
                ) {
                    Roles[id].jumpSpeed = 0;
                    nextY = (i + 1) * initData.blockThickness;
                }
            }
        } else if (Roles[id].jumpSpeed <= 0) {
            i = Math.floor((nextY + Roles[id].height) / initData.blockThickness);
            var j1 = Math.floor(x / initData.blockThickness);
            x += Roles[id].width;
            var j2 = Math.floor(x / initData.blockThickness);

            j1 = (j1 + roomMap[0].length) % roomMap[0].length;
            j2 = (j2 + roomMap[0].length) % roomMap[0].length;

            if (
                roomMap[i] &&
                Roles[id].y + Roles[id].height < i * initData.blockThickness
            ) {
                if (
                    roomMap[i][j1] !== " " ||
                    roomMap[i][j2] !== " " &&
                    x !== j2 * initData.blockThickness
                ) {
                    nextY = i * initData.blockThickness - Roles[id].height;
                    clearInterval(Roles[id].verticalTimer);
                    Roles[id].verticalTimer = undefined;
                }
            }
        }
        Roles[id].y = nextY;

        // update role's block pos
        i = Math.floor((Roles[id].y + Roles[id].height) / initData.blockThickness);
        Roles[id].i = i;
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

    console.log(i + 1, j);

    socket.on('loaded', () => {
        if (newRole) return;

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
        //jumpPreTreat
        if (Roles[info.id] && !Roles[info.id].verticalTimer) {
            Roles[info.id].jumpSpeed = Roles[info.id].power;
            Roles[info.id].verticalTimer = setInterval(
                () => verticalMove(info.id),
                initData.interval,
            );
        }
    });

    socket.on('to squat', (data) => {
        socket.broadcast.emit('squat', data);
        squatTreat(JSON.parse(data).id, true);
    });

    socket.on('to stand', (data) => {
        socket.broadcast.emit('stand', data);
        squatTreat(JSON.parse(data).id, false);
    });

    socket.on('to go down', (data) => {
        socket.broadcast.emit('go down', data);
        goDown(JSON.parse(data).id);
    });

    socket.on('to move', (data) => {
        socket.broadcast.emit('move', data);
        var info = JSON.parse(data);
        try {
            if (Roles[info.id] === undefined) {
                throw "no such id";
            }
            var role = Roles[info.id];
            if (info.isRight) {
                role.x += role.moveSpeed;
            } else {
                role.x -= role.moveSpeed;
            }

            //impactJudge
            impactJudge(role.width, info.isRight, role.id);

            var j = Math.floor(role.x / initData.blockThickness);
            role.j = j;

            fallJudge(role.id);
            
            console.log(role.x, role.y);
        } catch (e) {
            console.log(e);
            socket.disconnect(true);
        }
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