module.exports = function(app) {
	return new GameRemote(app);
};
var GameRemote = function(app) {
	this.app = app;
};
var remote = GameRemote.prototype;