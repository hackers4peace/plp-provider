var Promise = require('es6-promise').Promise;

/**
 *
 */
module.exports = function(store) {

  /**
   * saves email authorized to modify given profile
   */
  this.create = function(email, profile) {
    return new Promise(function(resolve, reject){
      var triple = {
        subject: profile['@id'],
        predicate: 'http://schema.org/email',
        object: email
      };
      store.put(triple, function(err){
        if(err) reject(err);
        resolve(profile);
      });
    });
  };

  /**
   * returns authorization triple containing email authorized to modify given profile
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
   *
   */
  this.delete = function(uri) {
    return new Promise(function(resolve, reject) {
      this.get(uri)
      .then(function(auth){
        store.del(auth, function(err) {
          if(err) reject(err);
          resolve();
        });
      });
    }.bind(this));
  }.bind(this);

};
