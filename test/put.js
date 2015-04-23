var fs = require('fs');
var mocha = require('mocha');
var expect = require('chai').expect;
var supertest = require('supertest');
var jwt = require('jsonwebtoken');

var daemon = require('../daemon');
var config = require('../config');

var request = supertest(daemon);

var fixture = {"name":"put fixture","additionalname":"","description":"LOL","birthDate":"","nationality":"","website":"","image":"","address":[],"memberOf":[],"contactPoint":[],"interest":[],"type":"Person","id":"http://localhost:5000/739bd864-d6d3-48a2-af3a-1a81d65d5604"};

var uuid = fixture.id.split('/').pop();

fs.writeFileSync(config.dataDir + '/' + uuid, JSON.stringify(fixture));

var agent = { email: 'test@example.org' };
var token = jwt.sign(agent, config.secrets.jwt, { expiresInMinutes: 60*5 });


describe('PUT', function() {

  describe('HTTP status codes', function() {

    it("should respond 200 OK if updated");

    it("should respond 500 if server errors");

    it("should respond 401 if not authenticated", function(done){
      var path =  '/' + uuid;
      request.put(path)
        .set('Content-Type', 'application/ld+json')
        .send(JSON.stringify(fixture))
        .expect(401, done);
    });

    it("should respond 403 if not authorized", function(done){
      var path =  '/' + uuid;
      request.put(path)
        .set('Authorization', 'Bearer ' + token)
        .send(JSON.stringify(fixture))
        .expect(403, done);
    });

    it("should respond 403 Forbidden if doesn't exist", function(done){
      var path =  '/' + 'this-does-not-exist';
      request.put(path)
        .set('Authorization', 'Bearer ' + token)
        .expect(403, done); // FIXME passes with any code
    });
  });

});
