

'use strict';

const om = require('output-manager');
const O = new om.Out(); // console logging
const sOut = new om.Out(); // stream logging

const http = require('http');
const fs = require('fs');

O.i('Starting...');    
var WebSocketServer = require('ws').Server;
var PORT = 9000;
var wss = new WebSocketServer({port: PORT});
var messages = [];
O.i('WebSocketServer created...');  


const start = () => {
    O.i('Setting up websocket log stream');  
    sOut.level = om.LogLevel.TRACE;
    sOut.output = (msg) => { wss.broadcast(msg); };


}

//Event listener - listens to the incoming message
wss.on('connection', function (ws) {
    messages.forEach(function(message){
      ws.send(message);
    });
  
  //Listen to each message and broadcast the messages to other clients
    ws.on('message', function (message) {
      messages.push(message);
      console.log('Message Received: %s', message);
      wss.clients.forEach(function (conn) {
        conn.send(message);
      });
    });
  });


O.i('Starting http server...');     
const __server = http.createServer(function (request, response) {
    fs.readFile('./index.html', function (err, data) {
        if (err) {
            response.writeHead(500, {
                'Content-Length': err.length,
                'Content-Type': 'text/plain'
            });
            response.end(err, 'utf-8');
        } else {
            response.writeHead(200, {
                'Content-Length': data.length,
                'Content-Type': 'text/html'
            });
            response.end(data, 'utf-8');
        }
    });
}).on('close', function () {
    O.i('Server closed...');
}).on('clientError', function (exception, socket) {
    O.e("Client error : '" + exception + "'");
}).listen(8080); 

O.i('Everything started...');   

start();  
