var Promise = require('es6-promise').Promise;
var Errors = require('./errors');

/**
 * Verification module
 */
module.exports = function(storage) {

  /**
   * resolves with document that exists in storage
   * TODO verification needs storage
   */
  this.exists = function(req) {
    return new Promise(function(resolve, reject) {
      storage.get(req.uri)
      .then(function(doc) {
        resolve(doc);
      })
      .catch(reject);
    });
  };

  /**
   * resolves with document in request body
   * TODO first verify exist?
   */
  this.target = function(req) {
    return new Promise(function(resolve, reject) {
      if(req.body.id !== req.uri) reject(new Errors.Mismatch());
      resolve(req.body);
    });
  };

  /**
   * resolves with request
   */
  this.new = function(req) {
    return new Promise(function(resolve, reject) {
      if(req.body.id) reject(new Errors.Novelity());
      resolve(req);
    });
  };

};
