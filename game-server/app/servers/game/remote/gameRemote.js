module.exports = function(app) {
	return new GameRemote(app);
};
var GameRemote = function(app) {
	this.app = app;
};
var remote = GameRemote.prototype;

remote.testMsg = function(username,acckey, cb) {
	var self = this;

	console.log("game remote testMsg:->",username,acckey);
	cb();
	// this.app.get('rediscl').getDataByKey(username, function(err, reply) {
	// 	cb("remote test msg:->"+self.app.getServerId()+" :->"+reply);
	// });

	
};