var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var serveStatic = require('serve-static');
var hbs = require('hbs');

var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var UUID = require('uuid');
var request = require('superagent');
var levelgraph = require('levelgraph');

var Errors = require('./lib/errors');
var Persona = require('./lib/persona');
var Authorization = require('./lib/authorization');
var Verification = require('./lib/verification');
var FileStore = require('./lib/fileStore');

var config = require('./config');

var daemon = express();

daemon.use(cors({ origin: true, credentials: true }));
daemon.options('*', cors());

daemon.use(bodyParser.json({ type: 'application/json' }));
daemon.use(bodyParser.json({ type: 'application/ld+json' }));

daemon.use(restricted(expressJwt({ secret: config.secrets.jwt, userProperty: 'agent'})));
daemon.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.send(401, 'authentication required');
  }
});

daemon.use(addUri());

// HTML

// set view engine to handlebars
daemon.use(serveStatic('.'));
daemon.set('view engine', 'hbs');

hbs.registerHelper('j', function(val){
  if(val && val.join){
    return val.join(" ");
  } else {
    return val;
  }
});

/*
 * no favicon for now!
 */
daemon.get('/favicon.ico', function(req, res){
  res.send(404);
});


// TODO refactor storage to dataset.profiles and use LevelGraph
var storage = new FileStore(config.dataDir);

var authorization = new Authorization(levelgraph(process.env.NODE_ENV || 'tmp/' + UUID.v4()));
var verification = new Verification(storage);


daemon.post('/auth/login', function(req, res){

  /*
   * check audience
   * https://developer.mozilla.org/en/Persona/Security_Considerations#Explicitly_specify_the_audience_parameter
   */
  if(_.contains(config.audiences, req.headers.origin)){

    // persona verify
    Persona.verify(req.body.assertion, req.headers.origin)
    .then(function(verification){

      // TODO generate UUID for logout
      var agent = { email: verification.email };
      var token = jwt.sign(agent, config.secrets.jwt, { expiresInMinutes: 60*5 });

      res.json({ token: token });
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
  // TODO
  res.send(200);
});

daemon.get('/:uuid', function(req, res){
  storage.get(req.uri)          // -> doc
  .then(function(doc){
    res.format({
      'text/html': function(){
        var type = doc.type;
        // handle case of array
        if(typeof type == 'object') type = type[0];
        res.render(type, doc);
      },
      'application/json': function(){
        res.type('application/ld+json');
        res.send(JSON.stringify(doc));
      },
      'application/ld+json': function(){
        res.type('application/ld+json');
        res.send(JSON.stringify(doc));
      }
    });
  })
  .catch(function(err){
    res.send(statusCode(err), err.message);
  });
});

/**
 * authentication handled by express-jwt
 */
daemon.post('/', function(req, res){

  verification.new(req)        // -> req
  .then(generateId)            // -> req
  .then(authorization.create)  // -> doc
  .then(storage.save)          // -> doc
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
    res.send(statusCode(err), err.message);
  });
});

/**
 * authentication handled by express-jwt
 */
daemon.put('/:uuid', function(req, res){
  authorize(req)               // -> req
  .then(verification.target)   // -> doc
  .then(storage.save)          // -> doc
  .then(function(){
    res.send(200, 'updated!');
  })
  .catch(function(err){
    res.send(statusCode(err), err.message);
  });
});


/**
 * authentication handled by express-jwt
 */
daemon.delete('/:uuid', function(req, res){
  authorize(req)               // -> req
  .then(verification.exists)   // -> doc
  .then(storage.delete)        // -> doc
  .then(authorization.delete)  // -> null
  .then(function(){
    res.send(204, 'deleted!');
  })
  .catch(function(err){
    res.send(statusCode(err), err.message);
  });
});

module.exports = daemon;


/**
 * GET requests don't require authentication
 * attribution: http://stackoverflow.com/a/19337607/2968245
 */
function restricted(fn) {
  return function(req, res, next) {
    if (req.method === 'GET' || req.path.match(/\/auth/)) {
      next();
    } else {
      fn(req, res, next);
    }
  };
}

/**
 * TODO get domain from req?
 */
function addUri() {
  return function(req, res, next) {
    if(req.method !== 'POST') {
      req.uri = 'http://' + config.domain + req.path;
    }
    next();
  };
}

function generateId(req) {
  return new Promise(function(resolve, reject){
    req.body['@id'] = 'http://' + config.domain + '/' + UUID.v4();
    resolve(req);
  });
}

function authorize(req) {
  return new Promise(function(resolve, reject){
    authorization.get(req.uri)
    .then(function(auth) {
      if(!auth || req.agent.email !== auth.object) reject(new Errors.Authorization());
      resolve(req);
    })
    .catch(reject);
  });
}

/**
 * 401 Unauthorized handled by express-jwt
 */
function statusCode(error) {
  // debug
  //console.log('statusCode', error);

  var code = 500;
  if(error instanceof Errors.Authorization) code = 403;
  if(error instanceof Errors.Existance) code = 404;
  if(error instanceof Errors.Mismatch) code = 400;
  if(error instanceof Errors.Novelity) code = 409;
  if(code === 500) {
    // TODO add error reporting
  }
  return code;
}

