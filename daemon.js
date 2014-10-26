var fs = require('fs');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var UUID = require('uuid');
var config = require('./config');

var daemon = express();

daemon.use(cors({ origin: true }));
daemon.options('*', cors());

daemon.use(bodyParser.json({ type: 'application/ld+json' }));

daemon.post('/', function(req, res){

	var profile = req.body;
	if (!profile) res.send(500);

	var uuid = UUID.v4();
	if (profile["about"]["@id"])
		uuid = profile["about"]["@id"];

	var path = config.profilesDir + '/' + uuid;
	var uri = 'http://' + config.domain + '/' + uuid;
	profile["@id"] = uri;

	fs.writeFile(path, JSON.stringify(profile), function(err, data){
		if(err){
			// TODO add error reporting
			res.send(500);
		} else {
			var min = {
				"@context": profile["@context"],
				"@id": uri,
				"@type": profile["@type"]
			};
			res.type('application/ld+json');
			res.send(min);
		}
	});

});

daemon.get('/:uuid', function(req, res){
	var path = config.profilesDir + '/' + req.params.uuid;
	fs.readFile(path, function(err, data){
		if(err){
			// TODO add error reporting
			res.send(500);
		} else {
			res.type('application/ld+json');
			res.send(data.toString());
		}
	});
});

daemon.listen(config.listenOn, function(){
	console.log('listening on: ', config.listenOn);
});
