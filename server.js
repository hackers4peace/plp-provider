var daemon = require('./daemon');
var config = require('./config');

var port = config.listenOn;

daemon.listen(port, function(){
  console.log('listening on: ', port);
});

