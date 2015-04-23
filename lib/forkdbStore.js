var Promise = require('es6-promise').Promise;
var concat = require('concat-stream');

module.exports = function(fdb) {

  this.get = function(uri){
    return new Promise(function(resolve, reject){
      var headsCS = concat(function(hashes) {
        var readCS = concat(function(buffer){
          resolve(JSON.parse(buffer.toString()));
        });
        var r = fdb.createReadStream(hashes[0].hash);
        r.pipe(readCS);
      });
      var h = fdb.heads(uri);
      h.pipe(headsCS);
    });
  };

  this.save = function(profile){
    return new Promise(function(resolve, reject){
      var w = fdb.createWriteStream({ key: profile.id }, function(err, id) {
        if (err) reject(err);
        else {
          profile['forkdb:head'] = id;
          resolve(profile);
        }
      });
      w.end(JSON.stringify(profile));
    });
  };

  /**
   * deletes resource
   */
  this.delete = function(doc){
    return new Promise(function(resolve, reject){
      //TODO
    });
  };

};
