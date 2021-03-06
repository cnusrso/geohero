var myrouteutil = module.exports;
var dispatcher = require('./dispatcher');

myrouteutil.game = function(session, msg, app, cb) {
	var gameServers = app.getServersByType('game');

	if(!gameServers || gameServers.length === 0) {
		cb(new Error('can not find game servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('uid'), gameServers);
	// console.log("route to game server:->",res.id);
	cb(null, res.id);
};