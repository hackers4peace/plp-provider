var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var UUID = require('uuid');
var config = require('./config');

var daemon = express();

daemon.use(cors({ origin: true }));
daemon.options('*', cors());

daemon.use(bodyParser.json());

daemon.post('/create', function(req, res){

  var uuid = UUID.v4();
  var path = config.profilesDir + '/' + uuid;
  var uri = 'http://' + config.domain + '/' + uuid;
  var profile = req.body;

  fs.writeFile(path, JSON.stringify(profile), function(err){
    // FIXME handle error
    res.send(200, uri);
  });

});

daemon.get('/:uuid', function(req, res){
  var path = config.profilesDir + '/' + req.params.uuid;
  fs.readFile(path, function(err, data){
    // FIXME handle error
    res.json(data.toString());
  });
});

daemon.listen(config.port, function(){
  console.log('listening on: ', config.port);
});
