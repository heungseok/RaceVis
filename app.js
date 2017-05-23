/**
 * Created by heungseok2 on 2017-05-13.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
// var world = require('./js/server_world');

app.use('/js', express.static(__dirname + '/js'));
app.use('/style', express.static(__dirname + '/style'));
app.use('/data', express.static(__dirname + '/data'));
app.use('/img', express.static(__dirname + '/img'));


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/index_nonSmooth', function (req, res) {
    res.sendFile(__dirname + '/index_nonSmooth.html');
});

app.get('/backup', function (req, res) {
    res.sendFile(__dirname + '/index_backup.html');
});



http.listen(4444, function(){
    console.log("Server Running and Listen to port 4444");
});