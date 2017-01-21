var myrouteutil = module.exports;
var dispatcher = require('./dispatcher');

myrouteutil.connector = function(session, msg, app, cb) {
	var gameServers = app.getServersByType('connector');

	if(!gameServers || gameServers.length === 0) {
		cb(new Error('can not find connector servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('uid'), gameServers);
	cb(null, res.id);
};

myrouteutil.game = function(session, msg, app, cb) {
	var gameServers = app.getServersByType('game');

	if(!gameServers || gameServers.length === 0) {
		cb(new Error('can not find game servers.'));
		return;
	}
	
	var res = dispatcher.dispatch(session.get('uid'), gameServers);
	cb(null, res.id);
};