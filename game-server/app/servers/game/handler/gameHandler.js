module.exports = function(app) {
	return new Handler(app);
};
var Handler = function(app) {
	this.app = app;
};
var handler = Handler.prototype;


handler.testMsg = function(msg, session, next) {
	if(msg.acckey === undefined)
	{
		console.log('Not Find "AccKey"');
		next(null, {code: 202, msg: 'Not Defined AccKey'});
		return;
	}
	if(msg.username === undefined)
	{
		console.log('Not Find "username"');
		next(null, {code: 202, msg: 'Not Defined username'});
		return;
	}
	
	next(null, {code: 200, msg: 'testMsg Ok:->'+msg.username+'->'+this.app.getServerId()});
};