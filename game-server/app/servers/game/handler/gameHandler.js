
var myScheduler = require("pomelo-scheduler");
var myasync = require("async");


module.exports = function(app) {
	return new Handler(app);
};
var Handler = function(app) {
	this.app = app;

	this.pScheduleJobId = 0;
	this.pScheduleUserIds = [];// [userid,param]

	this.commonutil = app.get('_commonutil');
	this.rediscl = app.get('_rediscl');
	this.tableutil = app.get('_tableUtil');
	this.databaseutil = app.get('_databaseUtil');
	this.directionUtil = app.get('_directionUtil');


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
	
	var self = this;

	var sessionService = this.app.get('backendSessionService');

	var frontServerId = session.frontendId;
	var userid = session.uid;
	sessionService.getByUid(frontServerId,userid,function(err, BackendSessions){
		// console.log('session',session);
		// console.log('BackendSessions',BackendSessions);		
		var channelService = self.app.get('channelService');
		channelService.pushMessageByUids("pushmsg",{code:578,msg:"abcdefg"},[{uid:userid, sid:frontServerId}],null,function(err){
			if(err){
				console.log("pushMessageByUids err",err);
			}
		});
	});
	
	// console.log("game server testMsg:->",msg.username,this.app.getServerId());
	next(null, {code: 200, msg: 'testMsg Ok:->'+msg.username+'->'+this.app.getServerId()});
};


// check battle status...
Handler.prototype.loopfunc_updateBattle = function(data){
	console.log("loopfunc_updateBattle :",data.owner.app.getServerId(),data.owner.pScheduleUserIds);

	var self = data.owner;


	for(var i = 0; i < self.pScheduleUserIds.length; ++ i){		
		if(self.pScheduleUserIds[i][1] != 1){
			continue;
		}
		var pKey_userid2battlekey = self.rediscl.pRedisKeys.key_userid_battlekey(self.pScheduleUserIds[i][0]);
		self.rediscl.getDataByKey(pKey_userid2battlekey,i,function(sErr,sData,index){
			if(sErr != null || sData == null){
				// user id no battle data,make invalid.
				self.pScheduleUserIds[index][1] = 0;
			}else{
				var pUsersBattlesData = JSON.parse(sData);
				for(var j = 0; j < pUsersBattlesData.length; ++ j){
					self.rediscl.getDataByKey(pUsersBattlesData[j],j,function(sErr,sData,index){
						if(sErr != null || sData == null){
							return;
						}
						var oneBattleData = JSON.parse(sData);
						var nLastTime = Math.floor(((new Date()).getTime() - oneBattleData.begintime)/1000);

						var nAllTime = [];//each source position to dest pos data...
						for(var d = 0; d < oneBattleData.distance.length; ++ d){
							nAllTime[d] = 0;
							oneBattleData.distance[d].route.paths[0].steps.forEach(function(onestep){
								nAllTime[d] += parseInt(onestep.duration);
							});
						}
						for(var d = 0; d < nAllTime.length; ++ d){
							if(nAllTime[d] <= nLastTime){
								console.log("battle reached!!!",oneBattleData.sourceids,oneBattleData.targetid);
							}else{								
								console.log("battle in process!!!",parseInt(Math.floor(nLastTime*100/nAllTime[d]))+"%",oneBattleData.sourceids,oneBattleData.targetid);
							}
						}
					});
				}
			}
		});
	}
};