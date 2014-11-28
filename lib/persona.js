var Promise = require('es6-promise').Promise;
var request = require('superagent');

/**
 * verifies assertion
 * https://developer.mozilla.org/en-US/Persona/Remote_Verification_API
 */
function verify(assertion, origin){
  return new Promise(function(resolve, reject) {
    request.post('https://verifier.login.persona.org/verify')
      .send({
        assertion: assertion,
        audience: origin
      })
      .end(function(err, res){
        if(err) reject(err);
        if(res.ok){
          resolve(res.body);
        } else {
          reject(res.error);
        }
      });
  });
}

module.exports.verify = verify;
