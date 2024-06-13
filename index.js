const fs = require('fs'); //the file system
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const path = require('path');

const socketio = require('socket.io');

const app = express();

app.use(cors()); //this will open our Express API to ANY domain

// app.use((req, res, next) => {
//     res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//     res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//     next();
//   });
  
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
    console.log("A user connected with id: ", socket.id);
    
    socket.on("user_info_to_signaling_server", (data) => {
        var other_users = userConnection.filter(p => p.droneID === data.droneID);
        
        userConnection.push({
            connectionId: socket.id,
            droneID: data.droneID,
            isHost: data.isHost
        });

        console.log(`all users ${userConnection.map(a => a.connectionId)}`);
        console.log(`other users ${other_users.map(a => a.connectionId)}`);
    
        other_users.forEach(other_user => {
            if(other_user.isHost === 'true') { // Host
                socket.to(other_user.connectionId).emit('host_to_inform', {
                    connId: socket.id,
                });

                socket.emit("new_connection_information", other_user);
            }
        });
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
            var droneID = disUser.droneID;
            userConnection = userConnection.filter(p => p.connectionId != socket.id);
            var host = userConnection.filter( p => p.isHost == 'true');
            // var restUser = userConnection.filter( p => p.meeting_id == meetingId);
            //restUser.forEach(n => {
            socket.to(host.connectionId).emit('closedConnectionInfo', socket.id);
            //});
        }
    });
})