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

daemon.post('/', function(req, res){

  var uuid = UUID.v4();
  var path = config.profilesDir + '/' + uuid;
  var uri = 'http://' + config.domain + '/' + uuid;
  var profile = req.body;
  profile["@id"] = uri;

  fs.writeFile(path, JSON.stringify(profile), function(err, data){
    // FIXME handle error
    var min = {
      "@context": profile["@context"],
      "@id": uri,
      "@type": profile["@type"]
    };
    res.json(min);
  });

});

daemon.get('/:uuid', function(req, res){
  var path = config.profilesDir + '/' + req.params.uuid;
  fs.readFile(path, function(err, data){
    // FIXME handle error
    res.json(data.toString());
  });
});

daemon.listen(config.listenOn, function(){
  console.log('listening on: ', config.listenOn);
});
