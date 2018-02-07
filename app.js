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

// Say hello
io.on('connection', (socket) => {
    var Hello = {
        hello: "world"
    }
    socket.emit('news', JSON.stringify(Hello));
    socket.on('my other event', (data) => {
    console.log(JSON.parse(data));
  });
});