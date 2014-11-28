var mocha = require('mocha');
var expect = require('chai').expect;
var supertest = require('supertest');

var config = require('../config');

var request = supertest('http://' + config.domain);

var fixture = {"name":"","additionalname":"dfafda","description":"","birthDate":"","nationality":"","website":"","image":"","address":[],"memberOf":[],"contactPoint":[],"interest":[],"@type":"Person"};


describe('POST', function() {

  it('should respond with short profile with @id') /*, function(done) {
    var path =  '/';
    request.post(path)
      .set('Content-Type', 'application/ld+json')
      .send(JSON.stringify(fixture))
      .end(function(err, res) {
        if(err) throw err;
        var min = JSON.parse(res.text);
        expect(min['@id']).to.exist;
        done();
      });
  }); */

  describe('Content Type', function() {

    it('should set JSON-LD') /*, function(done) {
      var path =  '/';
      request.post(path)
        .set('Content-Type', 'application/ld+json')
        .send(JSON.stringify(fixture))
        .expect('Content-Type', /application\/ld\+json/)
        .expect(200, done);
    }); */

    it('should handle requests with other content types');

  });

  describe('HTTP status codes', function() {

    it("should respond 500 if server errors");
    it("should respond 401 if not authenticated");

    it("should respond 409 if profile includes @id") /*, function(done) {
      fixture["@id"] = "http://example.net/abc";
      var path =  '/';
      request.post(path)
        .set('Content-Type', 'application/ld+json')
        .send(JSON.stringify(fixture))
        .expect(409, done);
    }); */

  });
});
