var mocha = require('mocha');
var expect = require('chai').expect;
var supertest = require('supertest');
var jwt = require('jsonwebtoken');

var daemon = require('../daemon');
var config = require('../config');

var request = supertest(daemon);

var fixture = {"name":"post fixture","additionalname":"dfafda","description":"","birthDate":"","nationality":"","website":"","image":"","address":[],"memberOf":[],"contactPoint":[],"interest":[],"type":"Person"};
var agent = { email: 'test@example.org' };
var token = jwt.sign(agent, config.secrets.jwt, { expiresInMinutes: 60*5 });


describe('POST', function() {

  it('should respond with short data with id', function(done) {
    var path =  '/';
    request.post(path)
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/ld+json')
      .send(JSON.stringify(fixture))
      .end(function(err, res) {
        if(err) throw err;
        var min = JSON.parse(res.text);
        expect(min.id).to.exist;
        done();
      });
  });

  describe('Content Type', function() {

    it('should set JSON-LD', function(done) {
      var path =  '/';
      request.post(path)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/ld+json')
        .send(JSON.stringify(fixture))
        .expect('Content-Type', /application\/ld\+json/)
        .expect(200, done);
    });

    it('should handle requests with other content types');

  });

  describe('HTTP status codes', function() {

    it("should respond 500 if server errors");

    it("should respond 401 if not authenticated", function(done){
      var path =  '/';
      request.post(path)
        .set('Content-Type', 'application/ld+json')
        .send(JSON.stringify(fixture))
        .expect(401, done);
    });

    it("should respond 409 if profile includes id", function(done) {
      fixture.id = "http://example.net/abc";
      var path =  '/';
      request.post(path)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/ld+json')
        .send(JSON.stringify(fixture))
        .expect(409, done);
    });

  });
});
