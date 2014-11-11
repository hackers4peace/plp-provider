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
      fs.writeFile(path, JSON.stringify(content), function(err){
        if(err) reject(err);
        resolve(content);
      });
    });
  },
  delete: function(uuid){
    return new Promise(function(resolve, reject){
      var path = config.profilesDir + '/' + uuid;
      fs.unlink(path, function(err){
        if(err) reject(err);
        resolve();
      });
    });
  },
};

daemon.post('/', function(req, res){
  var profile = req.body;

  // return 409 Conflict if profile includes @id
  if(profile["@id"]) {
    res.send(409);
  } else {
    var uuid = UUID.v4();
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
    }
});

daemon.get('/:uuid', function(req, res){
  storage.get(req.params.uuid)
    .then(function(data){
      res.type('application/ld+json');
      res.send(data.toString());
    })
    .catch(function(err){
      // TODO add error reporting
      var code = 500;
      if(err.code === 'ENOENT') code = 404;
      res.send(code);
    });
});

daemon.put('/:uuid', function(req, res){
  // TODO add authentication
  storage.save(req.params.uuid, req.body)
    .then(function(){
      res.send(200);
    })
    .catch(function(err){
      // TODO add error reporting
      res.send(500);
    });
});

daemon.delete('/:uuid', function(req, res){
  // TODO add authentication
  storage.delete(req.params.uuid)
    .then(function(){
      res.send(200);
    })
    .catch(function(err){
      // TODO add error reporting
      res.send(500);
    });
});

daemon.listen(config.listenOn, function(){
  console.log('listening on: ', config.listenOn);
});
