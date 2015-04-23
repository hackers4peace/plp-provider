var mocha = require('mocha');
var chai = require('chai');
var supertest = require('supertest');
var fs = require('fs');

var daemon = require('../daemon');
var config = require('../config');

var fixture = {"name":"get fixture","additionalname":"","description":"LOL","birthDate":"","nationality":"","website":"","image":"","address":[],"memberOf":[],"contactPoint":[],"interest":[],"type":"Person","id":"http://localhost:5000/739bd864-d6d3-48a2-af3a-1a81d65d5604"};

var uuid = fixture.id.split('/').pop();

fs.writeFileSync(config.dataDir + '/' + uuid, JSON.stringify(fixture));

var request = supertest(daemon);

describe('GET', function() {
  it('should respond with existing profile', function(done) {
    var path =  '/' + uuid;
    request.get(path)
      .expect(200, done);
  });

  describe('Content Type', function() {
    it('should set HTML when unspecified');

    it('should set JSON-LD when requested', function(done) {
      var path =  '/' + uuid;
      request.get(path)
        .accept('application/ld+json')
        .expect('Content-Type', /application\/ld\+json/)
        .expect(200, done);
    });

  });

  describe('HTTP status codes', function() {

    it("should respond 500 if server errors");
    it("should respond 410 Gone if previously deleted");
    it("should respond 301 Moved Permanently if moved");

    it("should respond 404 Not Found if profile never existed", function(done) {
      var path =  '/this-does-not-exist';
      request.get(path)
        .expect(404, done);
    });

  });
});
