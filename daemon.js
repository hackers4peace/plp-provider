var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var UUID = require('uuid');
var request = require('superagent');
var levelgraph = require('levelgraph');

var Persona = require('./lib/persona');
var Authorization = require('./lib/authorization');
var FileStore = require('./lib/fileStore');

var config = require('./config');


var daemon = express();

daemon.use(cors({ origin: true, credentials: true }));
daemon.options('*', cors());

daemon.use(bodyParser.json({ type: 'application/json' }));
daemon.use(bodyParser.json({ type: 'application/ld+json' }));
daemon.use(cookieParser(config.secrets.cookie));
daemon.use(cookieSession({ secret: config.secrets.session })); //FIXME CSRF


var authorization = new Authorization(levelgraph('authorizations'));

// TODO refactor storage to dataset.profiles and use LevelGraph
var storage = new FileStore(config.dataDir);


daemon.post('/auth/login', function(req, res){

  /*
   * check audience
   * https://developer.mozilla.org/en/Persona/Security_Considerations#Explicitly_specify_the_audience_parameter
   */
  if(_.contains(config.audiences, req.headers.origin)){

    // persona verify
    Persona.verify(req.body.assertion, req.headers.origin)
    .then(function(verification){

      // start session
      req.session.agent = {};
      req.session.agent.email = verification.email;

      res.json(req.session.agent);
    })
    .catch(function(err){
      // TODO add error reporting
      console.log(err);
      res.send(500);
    });
  } else {
    res.send(403);
  }
});

daemon.post('/auth/logout', function(req, res){
  req.session = null;
  res.send(200);
});


function authenticated(req) {
  if(req.session) {
    return req.session.agent;
  } else {
    return false;
  }
}

function authorized(req, auth) {
  return req.session.agent.email === auth.object;
}


daemon.get('/:uuid', function(req, res){
  var uri = 'http://' + config.domain + '/' + req.params.uuid;
  storage.get(uri)
    .then(function(data){
      res.type('application/ld+json');
      res.send(JSON.stringify(data));
    })
    .catch(function(err){
      // TODO add error reporting
      console.log(err);
      var code = 500;
      // FIXME abstract error for any storage
      if(err.code === 'ENOENT') code = 404;
      // TODO implement HTTP 410 if previously deleted #7
      res.send(code);
    });
});

daemon.post('/', function(req, res){
  var profile = req.body;

  if(profile["@id"]) {
    res.send(409, 'new profile shouldn not have an @id');
  } else if(!authenticated(req)) {
    res.send(401);
  } else {
    profile["@id"] = 'http://' + config.domain + '/' + UUID.v4();
    authorization.create(req.session.agent.email, profile)
    .then(storage.save)
    .then(function(profile){
      var min = {
        "@context": profile["@context"],
        "@id": profile["@id"],
        "@type": profile["@type"]
      };
      res.type('application/ld+json');
      res.send(min);
    })
    .catch(function(err){
      // TODO add error reporting
      console.log(err);
      res.send(500);
    });
    }
});

daemon.put('/:uuid', function(req, res){
  var uri = 'http://' + config.domain + '/' + req.params.uuid;
  var profile = req.body;

  if(profile['@id'] !== uri) {
    res.send(400, '@id of profile in request does not match requested uri');
  } else if(!authenticated(req)) {
    res.send(401);
  } else {
    storage.get(profile['@id'])
    .then(function(old){
      return new Promise(function(resolve, reject){
        authorization.get(profile['@id'])
        .then(function(auth) {
          if(!authorized(req, auth)) reject('authorization failed');
          resolve(profile);
        });
      });
    })
    .then(storage.save)
    .then(function(){
      res.send(200);
    })
    .catch(function(err){
      console.log(err);
      var code = 500;
      // FIXME abstract error for any storage
      if(err.code === 'ENOENT') code = 404;
      if(err === 'authorization failed') code = 403;
      if(code === 500) {
        // TODO add error reporting
      }
      res.send(code);
    });
  }
});

daemon.delete('/:uuid', function(req, res){

  var uri = 'http://' + config.domain + '/' + req.params.uuid;
  if(!authenticated(req)) {
    res.send(401);
  } else {
    storage.get(uri)
    .then(function(profile){
      return new Promise(function(resolve, reject){
        authorization.get(profile['@id'])
        .then(function(auth) {
          if(!authorized(req, auth)) reject('authorization failed');
          resolve(profile['@id']);
        });
      });
    })
    .then(storage.delete)
    .then(authorization.delete)
    .then(function(){
      res.send(204);
    })
    .catch(function(err){
      console.log(err);
      var code = 500;
      // FIXME abstract error for any storage
      if(err.code === 'ENOENT') code = 404;
      if(err === 'authorization failed') code = 403;
      if(code === 500) {
        // TODO add error reporting
      }
      res.send(code);
    });
  }
});

daemon.listen(config.listenOn, function(){
  console.log('listening on: ', config.listenOn);
});
