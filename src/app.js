const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {generateMessage} = require("./utils/generateMessage")
const {addUser, removeUser, getUser, getRoomUsers} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = 3000;

const filter = new Filter();

io.on("connection", (socket) =>
{
    
    socket.on("join",({username, room}, callBack) =>
    {
        const {error, user} = addUser(socket.id, username, room)
        if (error) {
            return callBack(error);
        }
        socket.join(user.room);
        socket.emit("message", {message: generateMessage("Welcome!"),username: "Admin", roomName: user.room,  roomUsers: getRoomUsers(user.room)});
        socket.broadcast.to(user.room).emit("message", {message: generateMessage(`${user.username} Has Joined!`),username:  user.username,  roomUsers: getRoomUsers(user.room)});
    })

    socket.on("newMessage", (data, callBack) =>
    {
        const {room, username} = getUser(socket.id);
        message = data;
        if(filter.isProfane(data))
        {
            return callBack("Profan Not Allowed");
        }
        io.to(room).emit("message", {message: generateMessage(data), username});
        callBack();
    })
    socket.on("sendLocation", ({lat, long}, callback) =>
    {
        const {room, username} = getUser(socket.id);
        io.to(room).emit("locationMessage", generateMessage(`https://google.com/maps?q=${lat},${long}`, username))
        callback();
    })

    socket.on("disconnect", () =>
    {
        const {username, room} = removeUser(socket.id);
        if (username) {
            io.to(room).emit("message", {message: generateMessage(`${username} has left`), username, roomUsers: getRoomUsers(room)})
        }
    })
})

app.use(express.static(path.join(__dirname, '../public')));



server.listen(port, () =>
{
    console.log("Listen on PORT:-> ", port)
})
