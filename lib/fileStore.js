var fs = require('fs');
var Promise = require('es6-promise').Promise;

module.exports = function(dir) {

  this.get = function(uri){

    return new Promise(function(resolve, reject){
      var uuid = uri.split('/').pop();
      var path = dir + '/' + uuid;
      fs.readFile(path, 'utf8', function(err, data){
        if(err) reject(err);
        if(data) {
          data = JSON.parse(data);
        }
        resolve(data);
      });
    });
  };

  this.save = function(profile){
    return new Promise(function(resolve, reject){
      var uuid = profile['@id'].split('/').pop();
      var path = dir + '/' + uuid;
      fs.writeFile(path, JSON.stringify(profile), function(err){
        if(err) reject(err);
        resolve(profile);
      });
    });
  };

  /**
   * deletes resource
   */
  this.delete = function(doc){
    return new Promise(function(resolve, reject){
      var uuid = doc['@id'].split('/').pop();
      var path = dir + '/' + uuid;
      fs.unlink(path, function(err){
        if(err) reject(err);
        resolve(doc);
      });
    });
  };

};
