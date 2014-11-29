var mocha = require('mocha');
var chai = require('chai');
var supertest = require('supertest');
var fs = require('fs');

var config = require('../config');

var fixture = {
  uuid: '739bd864-d6d3-48a2-af3a-1a81d65d5604',
  content: {"name":"elf","additionalname":"","description":"LOL","birthDate":"","nationality":"","website":"","image":"","address":[],"memberOf":[],"contactPoint":[],"interest":[],"@type":"Person","@id":"http://localhost:5000/739bd864-d6d3-48a2-af3a-1a81d65d5604"}
};

fs.writeFileSync(config.dataDir + '/' + fixture.uuid, JSON.stringify(fixture.content));

var request = supertest('http://' + config.domain);

describe('GET', function() {
  it('should respond with existing profile', function(done) {
    var path =  '/' + fixture.uuid;
    request.get(path)
      .expect(200, done);
  });

  describe('Content Type', function() {

    it('should set JSON-LD', function(done) {
      var path =  '/' + fixture.uuid;
      request.get(path)
        .expect('Content-Type', /application\/ld\+json/)
        .expect(200, done);
    });

  });

  describe('HTTP status codes', function() {

    it("should respond 500 if server errors");

    it("should respond 404 if profile doesn't exit", function(done) {
      var path =  '/this-does-not-exist';
      request.get(path)
        .expect(404, done);
    });

  });
});
