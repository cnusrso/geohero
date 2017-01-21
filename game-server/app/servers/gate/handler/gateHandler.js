var dispatcher = require('../../../utils/dispatcher');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;


handler.queryConnector = function(msg, session, next) {
	var uid = msg.uid;
	if(!uid) {
		next(null, {
			code: 201,
			msg: "Not Defined uid"
		});
		return;
	}
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 202,
			msg: "Not Find connector Server!"
		});
		return;
	}
	// select connector
	var res = dispatcher.dispatch(uid, connectors);
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};