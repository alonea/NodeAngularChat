/** @description this file is as an entry point for the app
 * @author Rajesh Alonea
 * @copyright rajesh alonea
*/

//import section

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

//app Setup

let app = new express();
let server = http.createServer(app);
let io = socketio(server);
var port = process.env.PORT || 8000;;

//start Server on the Specified port

server.listen( port ,()=>{
    console.log('Server Started on the Port %d',port);
});

/*@Chat Section*/

// routing

app.use(express.static(path.join(__dirname,'public')));

// variable declaration

var numUsers =0;

io.on('connection', (socket) => {
    var addedUser = false;
  
    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });
  
    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
        console.log(username);
      if (addedUser) return;
  
      // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      console.log(numUsers);
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });
  
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });
  
    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });
  
    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
      if (addedUser) {
        --numUsers;
  
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
  });
  

