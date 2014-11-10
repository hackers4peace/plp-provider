var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var UUID = require('uuid');
var Promise = require('es6-promise').Promise;
var config = require('./config');

var daemon = express();

daemon.use(cors({ origin: true }));
daemon.options('*', cors());

daemon.use(bodyParser.json({ type: 'application/ld+json' }));

var storage = {
  get: function(uuid){
    return new Promise(function(resolve, reject){
      var path = config.profilesDir + '/' + uuid;
      fs.readFile(path, function(err, data){
        if(err) reject(err);
        resolve(data);
      });
    });
  },
  save: function(uuid, content){
    return new Promise(function(resolve, reject){
      var path = config.profilesDir + '/' + uuid;
      fs.writeFile(path, JSON.stringify(content), function(err, data){
        if(err) reject(err);
        resolve(content);
      });
    });
  }
};

daemon.post('/', function(req, res){

  var uuid = UUID.v4();
  var profile = req.body;
  profile["@id"] = 'http://' + config.domain + '/' + uuid;

  storage.save(uuid, profile)
    .then(function(data){
      var min = {
        "@context": data["@context"],
        "@id": data["@id"],
        "@type": data["@type"]
      };
      res.type('application/ld+json');
      res.send(min);
    })
    .catch(function(err){
      // TODO add error reporting
      res.send(500);
    });
});

daemon.get('/:uuid', function(req, res){
  storage.get(req.params.uuid)
    .then(function(data){
      res.type('application/ld+json');
      res.send(data.toString());
    })
    .catch(function(err){
      // TODO add error reporting
      res.send(500);
    });
});

daemon.listen(config.listenOn, function(){
  console.log('listening on: ', config.listenOn);
});
