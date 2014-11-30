var Promise = require('es6-promise').Promise;

/**
 *
 */
module.exports = function(store) {

  /**
   * saves email authorized to modify given resource
   */
  this.create = function(req) {
    return new Promise(function(resolve, reject){
      var triple = {
        subject: req.body['@id'],
        predicate: 'http://schema.org/email',
        object: req.agent.email
      };
      store.put(triple, function(err){
        if(err) reject(err);
        resolve(req.body);
      });
    });
  };

  /**
   * returns authorization triple containing email authorized to modify given resource
   */
  this.get = function(uri) {
    return new Promise(function(resolve, reject) {
      var pattern = {
        subject: uri,
        predicate: 'http://schema.org/email'
      };
      store.get(pattern, function(err, result) {
        if(err) reject(err);
        resolve(result[0]);
      });
    });
  };

  /**
   * delets authorization for given document
   */
  this.delete = function(doc) {
    return new Promise(function(resolve, reject) {
      this.get(doc['@id'])
      .then(function(auth){
        store.del(auth, function(err) {
          if(err) reject(err);
          resolve();
        });
      });
    }.bind(this));
  }.bind(this);

};
