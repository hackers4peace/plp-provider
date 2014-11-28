var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var UUID = require('uuid');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var request = require('superagent');
var levelgraph = require('levelgraph');
var config = require('./config');

var daemon = express();

daemon.use(cors({ origin: true, credentials: true }));
daemon.options('*', cors());

daemon.use(bodyParser.json({ type: 'application/json' }));
daemon.use(bodyParser.json({ type: 'application/ld+json' }));
daemon.use(cookieParser(config.secrets.cookie));
daemon.use(cookieSession({ secret: config.secrets.session })); //FIXME CSRF


/*
 * Mozilla Persona
 */
function verifyPersona(assertion, origin){
  return new Promise(function(resolve, reject) {
    request.post('https://verifier.login.persona.org/verify')
      .send({
        assertion: assertion,
        audience: origin
      })
      .end(function(err, res){
        if(err) reject(err);
        if(res.ok){
          // debug
          console.log('persona verification', res.body);

          resolve(res.body);
        } else {
          reject(res.error);
        }
      });
  });
}

// Private
authorizations = levelgraph('authorizations');

// TODO refactor storage to dataset.profiles and use LevelGraph

var storage = {
  get: function(uri){
    return new Promise(function(resolve, reject){
      var uuid = uri.split('/').pop();
      var path = config.profilesDir + '/' + uuid;
      fs.readFile(path, 'utf8', function(err, data){
        if(err) reject(err);
        if(data) {
          data = JSON.parse(data);
        }
        resolve(data);
      });
    });
  },
  save: function(profile){
    return new Promise(function(resolve, reject){
      var uuid = profile['@id'].split('/').pop();
      var path = config.profilesDir + '/' + uuid;
      fs.writeFile(path, JSON.stringify(profile), function(err){
        if(err) reject(err);
        resolve(profile);
      });
    });
  },
  delete: function(uri){
    return new Promise(function(resolve, reject){
      var uuid = uri.split('/').pop();
      var path = config.profilesDir + '/' + uuid;
      fs.unlink(path, function(err){
        if(err) reject(err);
        resolve(uri);
      });
    });
  },
};

daemon.post('/auth/login', function(req, res){

  /*
   * check audience
   * https://developer.mozilla.org/en/Persona/Security_Considerations#Explicitly_specify_the_audience_parameter
   */
  if(_.contains(config.audiences, req.headers.origin)){

    // persona verify
    verifyPersona(req.body.assertion, req.headers.origin)
    .then(function(verification){

      // start session
      req.session.agent = {};
      req.session.agent.email = verification.email;

      res.json(req.session.agent);
    })
    .catch(function(error){
      // TODO add error reporting
      console.log(error);
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

/**
 * saves email authorized to modify given profile
 */
function createAuthorization(email, profile) {
  return new Promise(function(resolve, reject){
    var triple = {
      subject: profile['@id'],
      predicate: 'http://schema.org/email',
      object: email
    };
    authorizations.put(triple, function(err){
      if(err) reject(err);
      resolve(profile);
    });
  });
}

/**
 * returns authorization triple containing email authorized to modify given profile
 */
function getAuthorization(uri) {
  return new Promise(function(resolve, reject) {
    var pattern = {
      subject: uri,
      predicate: 'http://schema.org/email'
    };
    authorizations.get(pattern, function(err, result) {
      if(err) reject(err);
      resolve(result[0]);
    });
  });
}

function deleteAuthorization(uri){
  return new Promise(function(resolve, reject) {
    getAuthorization(uri)
    .then(function(authorization){
      authorizations.del(authorization, function(err) {
        if(err) reject(err);
        resolve();
      });
    });
  });
}

daemon.post('/', function(req, res){
  // TODO add authentication
  console.log('agent', req.session.agent);

  var profile = req.body;

  if(!authenticated(req)) {
    res.send(401);
  } else if(profile["@id"]) {
    // return 409 Conflict if profile includes @id
    res.send(409);
  } else {
    // create profile
    var uuid = UUID.v4();
    profile["@id"] = 'http://' + config.domain + '/' + uuid;

    // FIXME rething profile data var names
    createAuthorization(req.session.agent.email, profile)
    .then(storage.save)
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
  var uri = 'http://' + config.domain + '/' + req.params.uuid;
  storage.get(uri)
    .then(function(data){
      res.type('application/ld+json');
      res.send(JSON.stringify(data));
    })
    .catch(function(err){
      // TODO add error reporting
      var code = 500;
      if(err.code === 'ENOENT') code = 404;
      // TODO implement HTTP 410 if previously deleted
      res.send(code);
    });
});

daemon.put('/:uuid', function(req, res){
  var uri = 'http://' + config.domain + '/' + req.params.uuid;
  if(!authenticated(req)) {
    res.send(401);
  } else {
    storage.get(uri)
    .then(function(profile){
      return new Promise(function(resolve, reject){
        getAuthorization(profile['@id'])
        .then(function(authorization) {
          if(req.session.agent.email === authorization.object) {
            resolve(profile);
          } else {
            reject('authorization failed');
          }
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
        getAuthorization(profile['@id'])
        .then(function(authorization) {
          if(req.session.agent.email === authorization.object) {
            resolve(profile['@id']);
          } else {
            reject('authorization failed');
          }
        });
      });
    })
    .then(storage.delete)
    .then(deleteAuthorization)
    .then(function(){
      res.send(204);
    })
    .catch(function(err){
      console.log(err);
      var code = 500;
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
