var fs = require('fs');
var mocha = require('mocha');
var expect = require('chai').expect;
var supertest = require('supertest');
var jwt = require('jsonwebtoken');

var daemon = require('../daemon');
var config = require('../config');

var request = supertest(daemon);

var fixture = {"name":"del","additionalname":"","description":"LOL","birthDate":"","nationality":"","website":"","image":"","address":[],"memberOf":[],"contactPoint":[],"interest":[],"type":"Person","id":"http://localhost:5000/739bd864-d6d3-48a2-af3a-1a81d65d5604"};

var uuid = fixture['id'].split('/').pop();

fs.writeFileSync(config.dataDir + '/' + uuid, JSON.stringify(fixture));

var agent = { email: 'test@example.org' };
var token = jwt.sign(agent, config.secrets.jwt, { expiresInMinutes: 60*5 });


describe('DELETE', function() {

  describe('HTTP status codes', function() {

    it("should respond 204 No Content if deleted");

    it("should respond 500 if server errors");

    it("should respond 401 Unauthorized if not authenticated", function(done){
      var path =  '/' + uuid;
      request.delete(path)
        .expect(401, done);
    });

    it("should respond 403 Forbidden if not authorized", function(done){
      var path =  '/' + uuid;
      request.delete(path)
        .set('Authorization', 'Bearer ' + token)
        .expect(403, done); // FIXME passes with any code
    });

    it("should respond 403 Forbidden if doesn't exist", function(done){
      var path =  '/' + 'this-does-not-exist';
      request.delete(path)
        .set('Authorization', 'Bearer ' + token)
        .expect(403, done); // FIXME passes with any code
    });

  });

});
