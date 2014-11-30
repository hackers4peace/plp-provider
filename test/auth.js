var mocha = require('mocha');
var expect = require('chai').expect;
var supertest = require('supertest');

var daemon = require('../daemon');
var config = require('../config');

var request = supertest(daemon);


describe('auth', function() {

  describe('login', function() {

    it("should respond with a token");

  });

  describe('logout', function() {

    it("should invalidate token");

  });

});
