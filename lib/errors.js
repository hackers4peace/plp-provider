module.exports = {

  Authorization: function() {
    this.name = 'AuthorizationError';
    this.message = 'not authorized';
  },

  Existance: function() {
    this.name = 'ExistanceError';
    this.message = 'resource not found';
  },

  Mismatch: function() {
    this.name = 'MismatchError';
    this.message = 'id of profile in request does not match requested uri';
  },

  Novelity: function() {
    this.name = 'NovelityError';
    this.message = 'new profile should not have an id';
  }

};
