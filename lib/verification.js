var Promise = require('es6-promise').Promise;

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
      var message =  '@id of profile in request does not match requested uri';
      console.log('id', req.body['@id']);
      console.log('uri', req.uri);
      if(req.body['@id'] !== req.uri) reject({ message: message });
      resolve(req.body);
    });
  };

  /**
   * resolves with request
   */
  this.new = function(req) {
    return new Promise(function(resolve, reject) {
      var message = 'new profile shouldn not have an @id';
      if(req.body['@id']) reject({ message: message });
      resolve(req);
    });
  };

};
