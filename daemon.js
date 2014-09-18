var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var UUID = require('uuid');
var config = require('./config');

var daemon = express();
daemon.use(bodyParser.json());

daemon.post('/create', function(req, res){

  var uuid = UUID.v4();
  res.send(200, profileUri);

});

daemon.get('/:uuid', function(req, res){

});

daemon.listen(config.port, function(){
  console.log('listening on: ', config.port);
});
