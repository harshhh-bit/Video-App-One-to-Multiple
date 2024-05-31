const fs = require('fs'); //the file system
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const path = require('path');

const socketio = require('socket.io');

const app = express();

app.use(cors()); //this will open our Express API to ANY domain

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //this will allow us to parse json in the body with the body parser
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer({}, app);

const io = socketio(server,{
    cors: [
        'https://localhost:3000',
        'https://localhost:3001',
        'https://localhost:3002',
        'https://fxuav5g.live/',
        // 'http://fxuav5g.live/', TEST ONLY
    ]
})

server.listen(8000, () => {
    console.log("Server is running");
});

const userRoutes = require('./routes/userRoute');

app.use('/', userRoutes);

// socket io work
var userConnection = [];

io.on("connection", (socket) => {
    socket.on("users_info_to_signaling_server", (data) => {
        var other_users = userConnection.filter(p => p.meeting_id == data.meeting_id);
        userConnection.push({
            connectionId: socket.id,
            user_id: data.current_user_name,
            meeting_id: data.meeting_id,
            is_host: data.is_host
        });

        console.log(`all users ${userConnection.map(a => a.connectionId)}`);
        console.log(`other users ${other_users.map(a => a.connectionId)}`);
    
        other_users.forEach(v => {
            socket.to(v.connectionId).emit('other_users_to_inform', {
                other_user_id: data.current_user_name,
                other_user_is_host: data.is_host,
                connId: socket.id
            });
        });

        socket.emit("newConnectionInformation", other_users);
    });

    socket.on('sdpProcess', (data) => {
        socket.to(data.to_connid).emit('sdpProcess', {
            message: data.message,
            from_connid: socket.id
        });
    });

    socket.on('disconnect', function() {
        var disUser = userConnection.find(p => p.connectionId == socket.id);
        if(disUser) {
            var meetingId = disUser.meeting_id;
            userConnection = userConnection.filter(p => p.connectionId != socket.id);
            var restUser = userConnection.filter( p => p.meeting_id == meetingId);
            restUser.forEach(n => {
                socket.to(n.connectionId).emit('closedConnectionInfo');
            });
        }
    });
})