// var AWS = require('aws-sdk');
// var myrequest = require('request');
// var myredis = require("redis");
// var myBabyParse = require("babyparse");
var myScheduler = require("pomelo-scheduler");
var myasync = require("async");




// AWS.config.loadFromPath('./config/aws-config_testuser1.json');
// var dynamodb = new AWS.DynamoDB();


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

module.exports = function(app) {
  return new Handler(app);
};

Handler.prototype.onUserLeave = function (thisObj, username, session) {
  if (session && session.uid) {
	console.log("user leave",session.uid);

	thisObj.rediscl.delDataByKey(username);

	// thisObj.app.rpc.game.gameRemote.testMsg(session,username,"abc",function(){
	// 	console.log("game remote callback!!!");
	// });
  }
};

Handler.prototype.OnExit = function(){
	// this.rediscl.setDataByKey('exit_time',myfun_getDateTimeStr());
	console.log("begin exit!!!!!!!!!!!!",this.app.getServerId());
};


Handler.prototype.func_PushMsgToClient = function(nUserId,sMsgId,pMsgData){
	var self = this;

	self.mycache_GetDataByUserId(nUserId,function(szResultOwner,pUserDataOwner){
		if (szResultOwner != "success") {
			console.log("func_PushMsgToClient mycache_GetDataByUserId err",szResultOwner);
			return;
		}
		var username = pUserDataOwner.datas[0].account;
		var sessionService = self.app.get('sessionService');
		var oldSession = sessionService.getByUid(username);
		if(oldSession != null){
			var channelService = self.app.get('channelService');

			channelService.pushMessageByUids(
				"pushmsg",
				{id:sMsgId,data:pMsgData},
				[{uid:oldSession[0].uid, sid:oldSession[0].frontendId}],
				null,
				function(err){
					if(err){
						console.log("func_PushMsgToClient err",err);
					}
				}
			);
		}
	});
};

// check battle status...
Handler.prototype.loopfunc_updateBattle = function(data){
	// console.log("loopfunc_updateBattle :",data.owner.app.getServerId(),data.owner.pScheduleUserIds);

	var self = data.owner;


	for(var i = 0; i < self.pScheduleUserIds.length; ++ i){		
		if(self.pScheduleUserIds[i][1] == 1){
			continue;
		}

		// read one player's battle data.
		var pKey_userid2battlekey = self.rediscl.pRedisKeys.key_userid_battlekey(self.pScheduleUserIds[i][0]);
		self.rediscl.getDataByKey(pKey_userid2battlekey,i,function(sErr,sData,index){
			if(sErr != null || sData == null){
				// user id no battle data,make invalid.
				self.pScheduleUserIds[index][1] = 1;
			}else{
				// read one player's all battle keys
				var pUserAllBattleKey = JSON.parse(sData);
				for(var j = 0; j < pUserAllBattleKey.length; ++ j){
					self.rediscl.getDataByKey(pUserAllBattleKey[j],[j,index],function(sErr,sOneBattleData,indexj){
						if(sErr != null || sOneBattleData == null){
							return;
						}
						// read one player's one battle data,each battle contain some subline battle
						var oneBattleData = JSON.parse(sOneBattleData);
						if(oneBattleData.isover == 1){
							return;
						}


						var nThisBattleLastTime = Math.floor(((new Date()).getTime() - oneBattleData.begintime)/1000);
						var bAllSubLineBattleOver = true;
						// calcate each subline battle..
						for(var d = 0; d < oneBattleData.distance.length; ++ d){
							var sThisLineStartPoiId = oneBattleData.distance[d].customData[1];
							var nIsThisLineBattleEnd = oneBattleData.distance[d].customData[2];
							if(nIsThisLineBattleEnd == 1){
								continue;
							}
							bAllSubLineBattleOver = false;

							var nThisLineMaxCostTime = parseInt(oneBattleData.distance[d].route.paths[0].duration);
							if(nThisLineMaxCostTime > nThisBattleLastTime){
								// solider move on road..
								console.log("solider on move to target->",parseInt(Math.floor(nThisBattleLastTime*100/nThisLineMaxCostTime))+"%",sThisLineStartPoiId,oneBattleData.targetid);
								continue;
							}

							console.log("solider reached->",sThisLineStartPoiId,oneBattleData.targetid);
							// set this subline battle end...
							oneBattleData.distance[d].customData[2] = 1;
							self.rediscl.setDataByKey(pUserAllBattleKey[indexj[0]],JSON.stringify(oneBattleData));

							// do battle calc, hp,is occupyed..
							myasync.waterfall(
								[
									function(callback) {
										console.log("1 get attacker's poi data");
										self.mycache_GetPoiData(sThisLineStartPoiId,function(szResult,pSourcePoiData){
											if(szResult != "success"){
												return callback(201,szResult);
											}
											callback(null,pSourcePoiData,oneBattleData.targetid);
										});
									},
									function (pSourcePoiData,targetId,callback){
										console.log("2 get defenser's poi data");
										self.mycache_GetPoiData(targetId,function(szResult,pTargetPoiData){
											if(szResult != "success"){
												return callback(202,szResult);
											}
											callback(null,pSourcePoiData,pTargetPoiData);
										});
									},
									function (pSourcePoiData,pTargetPoiData,callback){
										console.log("3 begin calcate");
										var nCurTime = self.commonutil.getDateTimeNumber();

										var nAttackerUserId = pSourcePoiData.datas[0].ownerid;
										var nDefenserUserId = pTargetPoiData.datas[0].ownerid;
										var nAttackerPoiId = pSourcePoiData.datas[0].poiid;
										var nDefenserPoiId = pTargetPoiData.datas[0].poiid;
										var nAttackerMonsterHp = pSourcePoiData.datas[0].monsterhp;
										var nDefenserMonsterHp = pTargetPoiData.datas[0].monsterhp;										
										var nAttackerMonsterEndHp = nAttackerMonsterHp;
										var nDefenserMonsterEndHp = nDefenserMonsterHp - nAttackerMonsterHp;

										if(nAttackerUserId == nDefenserUserId){
											// already occupyed, other subline occupy it,not need fight.
											nDefenserMonsterEndHp = nDefenserMonsterHp;
										}else{
											console.log("nDefenserMonsterEndHp->",nDefenserMonsterEndHp);
											if(nDefenserMonsterEndHp < 0){
												// attacker occupy this poi success
												// set target poi's owner is attacker
												pTargetPoiData.datas[0].ownerid = pSourcePoiData.datas[0].ownerid;
												// reset target poi's monster hp to max
												var pLineData = self.tableutil.getLineById(self.tableutil.pTables.t_monster.table.data,parseInt(pTargetPoiData.datas[0].monsterid));
												pTargetPoiData.datas[0].monsterhp = self.tableutil.getLineValue(pLineData,self.tableutil.pTables.t_monster.map,"hp");
												pTargetPoiData.datas[0].occupytime = nCurTime;
												pTargetPoiData.datas[0].battleovertime = nCurTime;
												pTargetPoiData.datas[0].battlestatus = 0;
												// set 
												// update it.
												self.mycache_SetPoiData(pTargetPoiData.datas[0].poiid,JSON.stringify(pTargetPoiData));

												// set attacker poi leave battle
												pSourcePoiData.datas[0].battlestatus = 0;
												self.mycache_SetPoiData(pSourcePoiData.datas[0].poiid,JSON.stringify(pSourcePoiData));
											}else{
												// defenser monster hp loss...
												pTargetPoiData.datas[0].monsterhp = nDefenserMonsterEndHp;
												// update it.
												self.mycache_SetPoiData(pTargetPoiData.datas[0].poiid,JSON.stringify(pTargetPoiData));

												// set attacker poi leave battle
												pSourcePoiData.datas[0].battlestatus = 0;
												self.mycache_SetPoiData(pSourcePoiData.datas[0].poiid,JSON.stringify(pSourcePoiData));
											}
										}
										
										callback(null,{
											attacker:nAttackerUserId,
											defenser:nDefenserUserId,
											attackerpoi:nAttackerPoiId,
											defenserpoi:nDefenserPoiId,
											attackerhp:nAttackerMonsterHp,
											defenserhp:nDefenserMonsterHp,
											attackerendhp:nAttackerMonsterEndHp,
											defenserendhp:nDefenserMonsterEndHp
										});
									},
								],
								function(err, result) {
									if(err !== null){
										// an error occur,push to client...
										console.log("battle calcate error",err,result);
										return;
									} else {

										// push battle result msg to attacker/defenser client
										self.func_PushMsgToClient(result.attacker,'battle_result',result);
										self.func_PushMsgToClient(result.defenser,'battle_result',result);
										return;
									}
								}
							);
						}
						if(bAllSubLineBattleOver){
							oneBattleData.isover = 1;
							self.rediscl.setDataByKey(pUserAllBattleKey[indexj[0]],JSON.stringify(oneBattleData));

							self.mycache_GetPoiData(oneBattleData.targetid,function(szResult,pTargetPoiData){
								if(szResult != "success"){
									console.log("get poi data err",szResult,pTargetPoiData);
								}
								pTargetPoiData.datas[0].battlestatus = 0;
								self.mycache_SetPoiData(pTargetPoiData.datas[0].poiid,JSON.stringify(pTargetPoiData));
							});
						}

					});
				}
			}
		});
	}
};


// warp self cache function ...........................................................
Handler.prototype.mycache_SetPoiData = function(szPoiId,sData){
	var pkey = this.rediscl.pRedisKeys.key_poiid_data(szPoiId);
	this.rediscl.setDataByKey(pkey,sData);
}
Handler.prototype.mycache_GetPoiData = function(szPoiId, funcCallback, pCallOwner) {
	var self = this;
	var pkey = self.rediscl.pRedisKeys.key_poiid_data(szPoiId);
	self.rediscl.getDataByKey(pkey,1,function(sErr,sData){
		if(sErr != null || sData == null){
			var sFilter = "poiid:"+szPoiId;
			self.databaseutil.yuntu_GetDataByFilter(self.databaseutil.sTable_t_poi,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				if(nResult == 1){
					pResult = JSON.parse(sBody);
					if (pResult.count == 1) {
						// only one poi is ok
						szResult = "success";
						// cache this poi's value.
						self.mycache_SetPoiData(szPoiId,sBody);
					} else {
						szResult = "failed";
					}
				} else {
					szResult = "system error";
				}
				if (pCallOwner != null && funcCallback != null) {
					funcCallback.call(pCallOwner, szResult, pResult);
				} else if (funcCallback != null) {
					funcCallback(szResult, pResult);
				}
			});	
		} else {
			// poi data in redis
			var pResult = JSON.parse(sData);
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, "success", pResult);
			} else if (funcCallback != null) {
				funcCallback("success", pResult);
			}
		}
	});
}

Handler.prototype.mycache_SetUserPois = function(nUserId,sData){
	var sKey = this.rediscl.pRedisKeys.key_userid_pois(nUserId);
	this.rediscl.setDataByKey(sKey,sData);
}
Handler.prototype.mycache_GetUserPois = function(nUserId, funcCallback, pCallOwner) {
	var self = this;
	// 强制从库中更新数据方法
	var pfunForceUpdate = function(){
		var sFilter = "ownerid:"+nUserId;
		self.databaseutil.yuntu_GetDataByFilter(self.databaseutil.sTable_t_poi,sFilter,function(nResult,sBody){
			var szResult = "";
			var pResult = {};
			console.log("again get user pois->",nResult,sBody);
			if(nResult == 1){
				pResult = JSON.parse(sBody);
				szResult = "success";
				self.mycache_SetUserPois(nUserId,sBody);
			} else {
				szResult = "system error";
			}
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, szResult, pResult);
			} else if (funcCallback != null) {
				funcCallback(szResult, pResult);
			}
		});
	};
	// 得到数据。。
	var pfunGetData = function(){
		var sKey = self.rediscl.pRedisKeys.key_userid_pois(nUserId);
		self.rediscl.getDataByKey(sKey,1,function(sErr,sData){
			if(sErr != null || sData == null){
				return pfunForceUpdate();
			} else {
				// data in redis
				var pResult = JSON.parse(sData);
				if (pCallOwner != null && funcCallback != null) {
					funcCallback.call(pCallOwner, "success", pResult);
				} else if (funcCallback != null) {
					funcCallback("success", pResult);
				}
			}
		});
	};
	
	// 先检查是否要从库中更新
	var sKeyDirty = self.rediscl.pRedisKeys.key_userid_pois_dirty(nUserId);
	self.rediscl.getDataByKey(sKeyDirty,1,function(sErr,sData){
		if(sErr != null || sData == null){
			pfunGetData();
		} else {
			if(sData == "1"){
				self.rediscl.setDataByKey(sKeyDirty,"0");
				pfunForceUpdate();
			} else {
				pfunGetData();
			}
		}
	});
}

Handler.prototype.mycache_SetUserData = function(szUserName,sData){
	var sKey = this.rediscl.pRedisKeys.key_username_data(szUserName);
	this.rediscl.setDataByKey(sKey,sData);
}
Handler.prototype.mycache_GetUserData = function(szUserName, funcCallback, pCallOwner) {
	var self = this;
	var sKey = self.rediscl.pRedisKeys.key_username_data(szUserName);
	self.rediscl.getDataByKey(sKey,1,function(sErr,sData){
		if(sErr != null || sData == null){
			// user not in redis,get it from db
			var sFilter = "account:"+szUserName;
			self.databaseutil.yuntu_GetDataByFilter(self.databaseutil.sTable_t_account,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				if(nResult == 1){
					pResult = JSON.parse(sBody);
					if (pResult.count == 1) {
						// only one account is ok
						szResult = "success";
						// cache this user's value.
						self.mycache_SetUserData(szUserName,sBody);
					} else {
						szResult = "failed";
					}
				} else {
					szResult = "system error";
				}
				if (pCallOwner != null && funcCallback != null) {
					funcCallback.call(pCallOwner, szResult, pResult);
				} else if (funcCallback != null) {
					funcCallback(szResult, pResult);
				}
			});
		}	else {
			// user in redis ...
			var pResult = JSON.parse(sData);
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, "success", pResult);
			} else if (funcCallback != null) {
				funcCallback("success", pResult);
			}
		}
	});
}

Handler.prototype.mycache_SetDataByUserId = function(nId, sData){
	var sKey = this.rediscl.pRedisKeys.key_userid_data(nId);
	this.rediscl.setDataByKey(sKey,sData);
}
Handler.prototype.mycache_GetDataByUserId = function(nId, funcCallback, pCallOwner) {
	var self = this;
	var sKey = self.rediscl.pRedisKeys.key_userid_data(nId);
	self.rediscl.getDataByKey(sKey,1,function(sErr,sData){
		if(sErr != null || sData == null){
			// user not in redis,get it from db
			var sFilter = "_id:"+nId;
			self.databaseutil.yuntu_GetDataByFilter(self.databaseutil.sTable_t_account,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				if(nResult == 1){
					pResult = JSON.parse(sBody);
					if (pResult.count == 1) {
						// only one account is ok
						szResult = "success";
						// cache this user's value.
						self.mycache_SetDataByUserId(nId,sBody);
					} else {
						szResult = "failed";
					}
				} else {
					szResult = "system error";
				}
				if (pCallOwner != null && funcCallback != null) {
					funcCallback.call(pCallOwner, szResult, pResult);
				} else if (funcCallback != null) {
					funcCallback(szResult, pResult);
				}
			});
		}	else {
			// user in redis ...
			var pResult = JSON.parse(sData);
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, "success", pResult);
			} else if (funcCallback != null) {
				funcCallback("success", pResult);
			}
		}
	});
}

Handler.prototype.mycache_SetExtDataByPoiTypeText = function(typetext, sData){
	var sKey = this.rediscl.pRedisKeys.key_poitypetext_extdata(typetext);
	this.rediscl.setDataByKey(sKey,sData);
}
Handler.prototype.mycache_GetExtDataByPoiTypeText = function(typetext, funcCallback, pCallOwner) {
	var self = this;
	var sKey = self.rediscl.pRedisKeys.key_poitypetext_extdata(typetext);
	self.rediscl.getDataByKey(sKey,1,function(sErr,sData){
		var pExtData = {};
		var szResult = "";
		if(sErr != null || sData == null){
			var nBaseIndex = self.tableutil.getBaseIndexByTypeText(typetext);
			var nBaseCost = self.tableutil.getBaseCostByIndex(nBaseIndex);
			pExtData.basetypeindex = nBaseIndex;
			pExtData.basecost = nBaseCost;
			var pMonsterNames = self.tableutil.getMaybeMonsterNamesByBaseIndex(pExtData.basetypeindex);
			pExtData.monstername = pMonsterNames;

			// 以类型名和类型ID缓存表数据
			self.mycache_SetExtDataByPoiTypeText(typetext,JSON.stringify(pExtData));
			szResult = "success";
		}else{
			pExtData = JSON.parse(sData);
			szResult = "success";
		}
		
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, szResult, pExtData);
		} else if (funcCallback != null) {
			funcCallback(szResult, pExtData);
		}
	});
}
// end warp self cache function ...........................................................


/*
	return: 
	code	msg
	200		register ok, msg's value is acckey
	201 	Not Defined Username
	202 	Not Defined Password
	203 	Has Same Account
	204 	Already Has User
	205 	system error
	206		yuntuapi error
	
*/
Handler.prototype.check_Register = function(msg,session,next) {
	
	if(msg.username === undefined)
	{
		console.log("Not Find 'username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
	else if(msg.password === undefined)
	{
		console.log('Not Find "password"');
		next(null, {code: 202, account: msg.username, msg: 'Not Defined Password'});
		return;
	}
	var self = this;

	// first check has user name...
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			// already has this user,can't register
			next(null, {
				code: 204,
				account: msg.username,
				msg: 'Has User'
			});
		} else if(szResult == "failed") {
			// can register
			
			var nCurTime = self.commonutil.getDateTimeNumber();
			var szAccKey = self.commonutil.crypto(msg.username+nCurTime.toString());
			var pInsertData = {
				_name:0,
				_location:"100,31",
				account:msg.username,
				password:self.commonutil.buildEndPassword(msg.username, msg.password),
				loginkey:szAccKey
			};
			var pData = JSON.stringify(pInsertData);
			self.databaseutil.yuntu_AddNewData(self.databaseutil.sTable_t_account,pData,function(nResult,pResultBody){
				
				if (nResult == 1) {
					var pResult = JSON.parse(pResultBody);
					if (pResult.status == 1) {
						// regist ok
						session.bind(msg.username);
						session.set('uid',msg.username);
						// session.set('connectorid',self.app.getServerId());
						session.set('acckey',szAccKey);
						session.on('closed', self.onUserLeave.bind(null, self,msg.username));
						session.pushAll();
						
						next(null, {
							code: 200,
							account: msg.username,
							msg: szAccKey
						});
					} else {
						next(null, {
							code: 205,
							account: msg.username,
							msg: pResult.info
						});
					}
				} else {
					next(null, {
							code: 207,
							account: msg.username,
							msg: pResultBody
						});
				}
			});
			
		} else {
			// system error
			next(null, {
				code: 206,
				account: msg.username,
				msg: 'amap yuntuapi response->' + szResult
			});
		}
	}
	);
};

/*
	return: 
	code	msg
	200		signin ok, msg's value is acckey
	201 	Not Defined username
	202 	Not Defined password
	203 	not find user
	204 	Failed check password
	205 	system error
	
*/
Handler.prototype.check_SignIn = function(msg, session, next) {

	if(msg.username === undefined)
	{
		console.log("Not Find 'Username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
	else if(msg.password === undefined)
	{
		console.log('Not Find "Password"');
		next(null, {code: 202, account: msg.username, msg: 'Not Defined Password'});
		return;
	}
	var self = this;
	
	// get this user data
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			
			var sStorePwd = self.commonutil.buildEndPassword(msg.username, msg.password);
			if (sStorePwd == pUserData.datas[0].password) {

				// check same user login again...
				var sessionService = self.app.get('sessionService');
				var oldSession = sessionService.getByUid(msg.username);
				// 	console.log("oldSessionoldSessionoldSession",oldSession)
				if (!!oldSession) {
					sessionService.kick(msg.username, "other login", function() {
						// delay call...
					});
				} else {
					
				}
				
				// check password ok,then update acckey
				var nCurTime = self.commonutil.getDateTimeNumber();
				var szAccKey = self.commonutil.crypto(msg.username+nCurTime.toString());
				var pInsertData = {
					_id:pUserData.datas[0]._id,
					loginkey:szAccKey
				};
				var pData = JSON.stringify(pInsertData);
				self.databaseutil.yuntu_UpdateNewData(self.databaseutil.sTable_t_account,pData,function(nResult,sData){
					if(nResult == 1){
						var pResult = JSON.parse(sData);
						if(pResult.status == 1)	{
							session.bind(msg.username);
							session.set('uid',msg.username);
							// session.set('connectorid',self.app.getServerId());
							session.set('acckey',szAccKey);
							session.on('closed', self.onUserLeave.bind(null, self,msg.username));
							session.pushAll();

							// update key ok, response client
							next(null, {
								code: 200,
								account: msg.username,
								msg: szAccKey
							});
							// update redis data
							pUserData.datas[0].loginkey = pInsertData.loginkey;
							self.mycache_SetUserData(msg.username,JSON.stringify(pUserData));

							// self.app.rpc.game.gameRemote.testMsg(session, msg.username, szAccKey, function(pdata){
							// 	console.log("pdatapdatapdata",pdata);
							// });	

						}	else {
							next(null, {
								code: 205,
								account: msg.username,
								msg: pResult.info
							});
						}
					} else {
						next(null, {
							code: 206,
							account: msg.username,
							msg: "system failed"
						});
					}					
				});
			} else {
				next(null, {
					code: 204,
					account: msg.username,
					msg: 'Failed check password'
				});
			}
		} else {
			next(null, {
				code: 203,
				account: msg.username,
				msg: szResult+'not find user'
			});
		}
	});
	
};


Handler.prototype.get_UserData = function(msg, session, next) {
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
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
// 			console.log("get user data name",decodeURI(pUserData.datas[0]._name));
			next(null, {code: 200, data:pUserData.datas[0]});
		} else {
			next(null, {code: 201, msg: 'Not Find User'});
		}
	});
};


Handler.prototype.get_UserPoiData = function(msg, session, next) {
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
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {code: 203,	msg: 'AccKey Is Error'});
				return;
			}
			
			// find all poi by user id
			self.mycache_GetUserPois(pUserData.datas[0]._id,function(szResult,pPoisData){
				if (szResult == "success") {
					var pSendObj = {};
					pSendObj.count = pPoisData.count;
					pSendObj.datas = [];
					for(var i = 0; i < pSendObj.count; ++ i){
						pSendObj.datas[i] = {};
						pSendObj.datas[i]._name = pPoisData.datas[i]._name;
						pSendObj.datas[i]._location = pPoisData.datas[i]._location;
						pSendObj.datas[i].poiid = pPoisData.datas[i].poiid;
					}
					next(null, {code: 200,	msg: JSON.stringify(pSendObj)});
				} else {
					next(null, {code: 204,	msg: szResult});
				}	
			});
			
		} else {
			next(null, {code: 201, msg: 'Not Find User'});
		}
	});
};


Handler.prototype.setBirthPosition = function(msg,session,next) {
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
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
			
			var szlocation=msg.poslng+','+msg.poslat;
			var pInsertData = {
				_id:pUserData.datas[0]._id,
				_name: '1',//msg.name.toString(),
				_location:szlocation
			};
			var pData = JSON.stringify(pInsertData);
			self.databaseutil.yuntu_UpdateNewData(self.databaseutil.sTable_t_account,pData,function(nResult,sData){
				if(nResult == 1){
					var pResult = JSON.parse(sData);
					if (pResult.status == 1) {
						// update ok, response client
						next(null, {
							code: 200,
							msg: msg.acckey
						});
						// update redis data
						pUserData.datas[0]._name = pInsertData._name;
						pUserData.datas[0]._location = pInsertData._location;
						self.mycache_SetUserData(msg.username, JSON.stringify(pUserData));
					} else {
						next(null, {
							code: 204,
							msg: pResult.info
						});
					}
				} else {
					next(null, {
						code: 205,
						msg: "update failed"
					});
				}
			});
		} else {
			console.log('Not Find User');
			next(null,{code:203,msg:'Not Find User'});
			return;
		}
	});
};


Handler.prototype.teleportToPosition = function(msg,session,next) {
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
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
//  				console.log("msg->",msg)
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
			
			var szlocation=msg.poslng+','+msg.poslat;
			var pInsertData = {
				_id:pUserData.datas[0]._id,
				_name: encodeURI(msg.name),
				_location:szlocation
			};
			var pData = JSON.stringify(pInsertData);
			console.log("pData:",pData);
			self.databaseutil.yuntu_UpdateNewData(self.databaseutil.sTable_t_account,pData,function(nResult,sData){
				if(nResult == 1){
					console.log("sData:",sData);
					var pResult = JSON.parse(sData);
					if(pResult.status == 1) {
						// update ok, response client
						next(null, {
							code: 200,
							msg: msg.acckey
						});
						// update user in redis.
						pUserData.datas[0]._name = pInsertData._name;
						pUserData.datas[0]._location = pInsertData._location;
						self.mycache_SetUserData(msg.username,JSON.stringify(pUserData));
					} else {
						next(null, {
							code: 204,
							msg: pResult.info
						});
					}
				}	else {
					next(null, {
						code: 205,
						msg: "Failed update"
					});
				}
			});
		} else {
			console.log('Not Find User');
			next(null,{code:203,msg:'Not Find User'});
			return;
		}
	});
};

// 取得一个据点当前的数据。
Handler.prototype.getPoiData = function(msg,session,next) {
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
	if(msg.poiid === undefined)
	{
		console.log('Not Find "poiid"');
		next(null, {code: 202, msg: 'Not Defined poiid'});
		return;
	}
	
	var self = this;
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
			self.mycache_GetPoiData(msg.poiid,function(szResult,pPoiData){
				var pExtData = {};
				var sCurPoiTypeText = msg.poitypetext;
				if(sCurPoiTypeText === ""){// poi 类型是空的时候
					sCurPoiTypeText = "null";
				}
				var key1 = self.rediscl.pRedisKeys.key_poitypetext_extdata(encodeURI(sCurPoiTypeText));
				self.rediscl.getDataByKey(key1,0,function(sErr,sData){
					if(sErr != null || sData == null){
						var nBaseIndex = self.tableutil.getBaseIndexByTypeText(sCurPoiTypeText);
						var nBaseCost = self.tableutil.getBaseCostByIndex(nBaseIndex);
						pExtData.basetypeindex = nBaseIndex;
						pExtData.basecost = nBaseCost;
						var pMonsterNames = self.tableutil.getMaybeMonsterNamesByBaseIndex(pExtData.basetypeindex);
						pExtData.monstername = pMonsterNames;
						
						// 以类型名和类型ID缓存表数据
						self.rediscl.setDataByKey(key1,JSON.stringify(pExtData));
						var key2 = self.rediscl.pRedisKeys.key_poitypeid_extdata(nBaseIndex);
						self.rediscl.setDataByKey(key2,JSON.stringify(pExtData));
					}else{
						pExtData = JSON.parse(sData);
					}
					if(szResult == "success"){
// 						console.log("poi data:->",pPoiData);
						var pOwnerData = {};
						var pmonsterdata = {};
						if(pPoiData.datas[0].ownerid > 0){
							pmonsterdata.id = pPoiData.datas[0].monsterid;
							pmonsterdata.hp = pPoiData.datas[0].monsterhp;
							pmonsterdata.lvl = pPoiData.datas[0].monsterlevel;

							var pLineData = self.tableutil.getLineById(self.tableutil.pTables.t_monster.table.data,parseInt(pmonsterdata.id));
							pmonsterdata.name = self.tableutil.getLineValue(pLineData,self.tableutil.pTables.t_monster.map,"name");
							pmonsterdata.maxhp = self.tableutil.getLineValue(pLineData,self.tableutil.pTables.t_monster.map,"hp");
							pmonsterdata.award = self.tableutil.getLineValue(pLineData,self.tableutil.pTables.t_monster.map,"award");
							pmonsterdata.icon = self.tableutil.getLineValue(pLineData,self.tableutil.pTables.t_monster.map,"icon");

							

							self.mycache_GetDataByUserId(pPoiData.datas[0].ownerid,function(szResultOwner,pUserDataOwner){
// 								console.log("Get Owner Data Result:",szResultOwner,pUserDataOwner);
								if (szResultOwner == "success") {
									pOwnerData.name = pUserDataOwner.datas[0].account;
									
									next(null, {code: 200,msg: JSON.stringify(pPoiData),ext: JSON.stringify(pExtData),monster:JSON.stringify(pmonsterdata),owner:JSON.stringify(pOwnerData)});
								} else if(szResultOwner == "failed") {
									next(null, {code: 200,msg: JSON.stringify(pPoiData),ext: JSON.stringify(pExtData),monster:JSON.stringify(pmonsterdata)});
								} else {
									// system error
									next(null, {code: 200,msg: JSON.stringify(pPoiData),ext: JSON.stringify(pExtData),monster:JSON.stringify(pmonsterdata)});
								}
							});
						} else {
							next(null, {code: 200,msg: JSON.stringify(pPoiData),ext: JSON.stringify(pExtData)});
						}
					} else {
// 						console.log('Not Find Poi',szResult,pExtData);
						next(null,{code:201,msg:'Not Find Poi->'+szResult,ext: JSON.stringify(pExtData)});
						return;
					}
				});
			});
		} else {
			console.log('Not Find User');
			next(null,{code:204,msg:'Not Find User'});
			return;
		}
	});
};

// 占领一个空据点
Handler.prototype.occupyEmptyBase = function(msg,session,next) {
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
	if(msg.poiid === undefined)
	{
		console.log('Not Find "poiid"');
		next(null, {code: 202, msg: 'Not Defined poiid'});
		return;
	}
	if(msg.poitypeid === undefined)
	{
		console.log('Not Find "poitypeid"');
		next(null, {code: 202, msg: 'Not Defined poitypeid'});
		return;
	}
	if(msg.poiname === undefined)
	{
		console.log('Not Find "poiname"');
		next(null, {code: 202, msg: 'Not Defined poiname'});
		return;
	}
	if(msg.poipos === undefined)
	{
		console.log('Not Find "poipos"');
		next(null, {code: 202, msg: 'Not Defined poipos'});
		return;
	}
	
	var self = this;
	self.mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
			
			self.mycache_GetPoiData(msg.poiid,function(szResult,pPoiData){
				
				if(szResult == "success"){// 有记录					
					if(pPoiData.datas[0].ownerid > 0){// 是否有人占领
						next(null, {code: 204,	msg: 'Has Man Occupyed'});
						return;
					}
				} else {// 未记录的点，可以占
					console.log('Not Find Poi',szResult,pPoiData);
				}
				// find poi type by poi id
// 				var key_poitypeid = toString(msg.poitypeid)+"_data";
				var key1 = self.rediscl.pRedisKeys.key_poitypeid_extdata(msg.poitypeid);
				self.rediscl.getDataByKey(key1,0,function(sErr,sData){
					var pExtData = {};
					if(sErr != null || sData == null){
						next(null, {code: 207,	msg: 'Not Find Poi ExtData'});
						return;
					}else{
						pExtData = JSON.parse(sData);
					}
					if(pUserData.datas[0].money < pExtData.basecost){
						next(null, {code: 208,	msg: 'Money Not Enough'});
						return;
					}
					
					// 更新内存数据
					var pNewMoney = pUserData.datas[0].money-pExtData.basecost;
					pUserData.datas[0].money = pNewMoney;
					self.mycache_SetUserData(msg.username,JSON.stringify(pUserData));
					
					// 更新用户的钱入库
					var pInsertData = {
						_id:pUserData.datas[0]._id,
						money:pNewMoney,
						loginkey:msg.acckey
					};
					var pData = JSON.stringify(pInsertData);
					self.databaseutil.yuntu_UpdateNewData(self.databaseutil.sTable_t_account,pData,function(nResult,sData){
						if(nResult == 1){
							var pResult = JSON.parse(sData);
							if(pResult.status == 1)	{
								// 随机产生一个怪数据
								var pNewMonsterData = self.tableutil.randomOneMonsterByBaseIndex(pExtData.basetypeindex);

								// 进行占领操作
								var nCurTime = self.commonutil.getDateTimeNumber();
								if(szResult == "success"){// 有记录进行更新
									var pUpdateData = {
										_id:pPoiData.datas[0]._id,
										_name:encodeURI(msg.poiname),
										_location:msg.poipos,
										ownerid:pUserData.datas[0]._id,
										occupytime:nCurTime,
										battleovertime:nCurTime,
										battlestatus:0,
										monsterid:pNewMonsterData.id,
										monsterlevel:1,
										monsterhp:pNewMonsterData.hp,
									};
									var pData = JSON.stringify(pUpdateData);
									self.databaseutil.yuntu_UpdateNewData(self.databaseutil.sTable_t_poi,pData,function(nResult,pResultBody){
										if (nResult == 1) {
											var pResult = JSON.parse(pResultBody);
											if (pResult.status == 1) {
												// update new poi data ok
												next(null, {code: 200,account: msg.username});
												
												// 更新poiid对应的数据
												if(szResult == "success"){// 有记录
												} else {// 未记录的点
													pPoiData = {};
													pPoiData.datas = [];
													pPoiData.datas[0] = {};
												}
												pPoiData.datas[0].ownerid = pUpdateData.ownerid;
												pPoiData.datas[0]._name = msg.poiname;
												pPoiData.datas[0]._location = pUpdateData._location;
												pPoiData.datas[0].occupytime = pUpdateData.occupytime;
												pPoiData.datas[0].battleovertime = pUpdateData.battleovertime;
												pPoiData.datas[0].battlestatus = pUpdateData.battlestatus;
												pPoiData.datas[0].monsterid = pUpdateData.monsterid;
												pPoiData.datas[0].monsterlevel = pUpdateData.monsterlevel;
												pPoiData.datas[0].monsterhp = pUpdateData.monsterhp;
												self.mycache_SetPoiData(msg.poiid,JSON.stringify(pPoiData));
												
												// 标记user对应的pois数据有变化
												var sKeyDirty = self.rediscl.pRedisKeys.key_userid_pois_dirty(pUserData.datas[0]._id);
												self.rediscl.setDataByKey(sKeyDirty,"1");
												
											} else {
												next(null, {
													code: 211,
													msg: pResultBody
												});
											}
										} else {
											next(null, {
													code: 212,
													msg: pResultBody
												});
										}
									});
									
								} else {// 未记录的点，创建新的
									var pInsertData = {
										_name:encodeURI(msg.poiname),
										_location:msg.poipos,
										poiid:msg.poiid,
										ownerid:pUserData.datas[0]._id,
										typeid:pExtData.basetypeindex,
										occupytime:nCurTime,
										battleovertime:nCurTime,
										battlestatus:0,
										monsterid:pNewMonsterData.id,
										monsterlevel:1,
										monsterhp:pNewMonsterData.hp,
									};
									var pData = JSON.stringify(pInsertData);
									self.databaseutil.yuntu_AddNewData(self.databaseutil.sTable_t_poi,pData,function(nResult,pResultBody){
										if (nResult == 1) {
											var pResult = JSON.parse(pResultBody);
											if (pResult.status == 1) {
												// add new poi data ok
												next(null, {code: 200,account: msg.username});
												
												// update newest poi data for redis..
												if(szResult == "success"){// 有记录					
													
												} else {// 未记录的点
													pPoiData = {};
													pPoiData.datas = [];
													pPoiData.datas[0] = {};
												}
												pPoiData.datas[0].ownerid = pInsertData.ownerid;
												pPoiData.datas[0]._name = msg.poiname;
												pPoiData.datas[0]._location = pInsertData._location;
												pPoiData.datas[0].occupytime = pInsertData.occupytime;
												pPoiData.datas[0].battleovertime = pInsertData.battleovertime;
												pPoiData.datas[0].battlestatus = pInsertData.battlestatus;
												pPoiData.datas[0].monsterid = pInsertData.monsterid;
												pPoiData.datas[0].monsterlevel = pInsertData.monsterlevel;
												pPoiData.datas[0].monsterhp = pInsertData.monsterhp;
												self.mycache_SetPoiData(msg.poiid,JSON.stringify(pPoiData));
												
												// 标记user对应的pois数据有变化
												var sKeyDirty = self.rediscl.pRedisKeys.key_userid_pois_dirty(pUserData.datas[0]._id);
												self.rediscl.setDataByKey(sKeyDirty,"1");
												
											} else {
												next(null, {
													code: 211,
													msg: pResultBody
												});
											}
										} else {
											next(null, {
													code: 212,
													msg: pResultBody
												});
										}
									});
								}
							}	else {
								next(null, {code: 213,	msg: pResult.info});
								return;
							}
						} else {
							next(null, {code: 214,	msg: "system failed"});
							return;
						}					
					});
				});
			});
		} else {
			console.log('Not Find User');
			next(null,{code:204,msg:'Not Find User'});
			return;
		}
	});	
	
};

// 开始一场战斗。
Handler.prototype.req_readyAttackBase = function(msg,session,next) {
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
	if(msg.destpoiid === undefined)//要打的目标点
	{
		console.log('Not Find "destpoiid"');
		next(null, {code: 202, msg: 'Not Defined destpoiid'});
		return;
	}
	if(msg.sourcepoiids === undefined)//用到的攻方的点数组
	{
		console.log('Not Find "sourcepoiids"');
		next(null, {code: 202, msg: 'Not Defined sourcepoiids'});
		return;
	}
	var self = this;
	myasync.waterfall(
		[
			function(callback) {
				console.log("1 check user right!!!");
				self.mycache_GetUserData(msg.username,function(szResult,pUserData){
					if (szResult != "success") {
						console.log('Not Find User:->',msg.username);
						return callback(203,'Not Find User');
					}
					if (szResult == "success") {
						if (msg.acckey != pUserData.datas[0].loginkey) {
							return callback(204,'Acckey Is Error');
						}
					}
					return callback(null, pUserData);	
				});
			},
			function(pUserData, callback) {
				console.log("2 get users battle data");
				var pUserBattleArray = [];
				var pKey_userid2battlekey = self.rediscl.pRedisKeys.key_userid_battlekey(pUserData.datas[0]._id);
				self.rediscl.getDataByKey(pKey_userid2battlekey,0,function(sErr,sData){
					if(sErr != null || sData == null){
						// 无数据
						pUserBattleArray = [];
					}else{
						// 还有旧数据
						pUserBattleArray = JSON.parse(sData);
						// todo 需要检测下对应的战斗是否已结束
						
					}
					return callback(null,pUserData,pUserBattleArray);
				});
			},
			function(pUserData, pUserBattleArray, callback) {
				console.log("3 check dest poi data");
				self.mycache_GetPoiData(msg.destpoiid,function(szResult,pDestPoiData){
					if(szResult == "success"){// 有记录					
						if(pDestPoiData.datas[0].ownerid > 0){// 有人占领
							//检测是否自己的。
							if(pDestPoiData.datas[0].ownerid == pUserData.datas[0]._id){
								return callback(205,'This Poi In Myself');
							}
							// 检测是否空闲状态
							if(pDestPoiData.datas[0].battlestatus != 0){
								// todo 需要更新此点的状态，看是否战斗结束。
								
								
								return callback(206,'This Poi In Battle');
							}
						}else{
							// 现在没人占。
							return callback(207,'This Poi Is Empty');
						}
					} else {// 未记录的点
						return callback(208,'This Poi Is Empty,Not Cached');
					}
					
					callback(null, pUserData, pUserBattleArray, pDestPoiData);	
				});
			},
			function(pUserData, pUserBattleArray, pDestPoiData, callback) {
				console.log("4 check source poi data!!!");
				var pSourcePoiDatas = new Map();
				for(var i = 0; i < msg.sourcepoiids.length; ++ i){
					self.mycache_GetPoiData(msg.sourcepoiids[i],function(szResult,pSourcePoiData){
						if(szResult == "success"){// 有记录					
							if(pSourcePoiData.datas[0].ownerid > 0){// 有人占领
								//检测是否自己的。
								if(pSourcePoiData.datas[0].ownerid != pUserData.datas[0]._id){
									return callback(209,'This Source Poi In Not Myself:'+pSourcePoiData.datas[0].poiid);
								}
								// 检测是否空闲状态
								if(pSourcePoiData.datas[0].battlestatus !== 0){
									// todo 需要更新此点的状态，看是否战斗结束。
									
									return callback(210,'This Poi In Battle:'+pSourcePoiData.datas[0].poiid);
								}
							}else{
								// 现在没人占。
								return callback(210,'This Poi Is Empty:'+pSourcePoiData.datas[0].poiid);
							}
						} else {// 未记录的点
							return callback(212,'This Poi Is Empty,Not Cached:'+pSourcePoiData.datas[0].poiid);
						}
						pSourcePoiDatas.set(pSourcePoiData.datas[0].poiid,pSourcePoiData);
						if(pSourcePoiDatas.size >= msg.sourcepoiids.length){
							return callback(null, pUserData, pUserBattleArray, pDestPoiData,pSourcePoiDatas);
						}
					});
				}
			},
			function(pUserData, pUserBattleArray, pDestPoiData, pSourcePoiDatas, callback){
				console.log("5 calcate walking data!!!");
				var pTargetPoint = pDestPoiData.datas[0]._location;
				var pTargetPoi = pDestPoiData.datas[0].poiid;
				var pAllDrivingData = [];
				
				
				var pFuncDoDistance = function(nResult,sBody,pCustomData){
					if(nResult !== 0){
						return callback(213,'Web Error Get Walking Data');
					}
					console.log("walking data length",sBody.length);
					var pDistanceData = JSON.parse(sBody);
					if(pDistanceData.status != 1){
						// 请求失败
						console.log("Request Walking Error,info:->"+pDistanceData.info+" infocode:->"+pDistanceData.infocode);
						
						// 再请求？？
						var pSourcePoint = pCustomData[0];
						var pSourcePoi = pCustomData[1];
						return self.directionUtil.gaodeweb_GetWalkingData(pSourcePoint,pTargetPoint,pFuncDoDistance,null,pCustomData);
// 						return callback(214,'Web Error Get Walking Data');
					}
					pDistanceData.customData = pCustomData;
					pAllDrivingData.push(pDistanceData);


					if(pAllDrivingData.length >= pSourcePoiDatas.size){
						return callback(null, pUserData, pUserBattleArray, pDestPoiData,pSourcePoiDatas,pAllDrivingData);
					}
				};
				pSourcePoiDatas.forEach(function(value, key, map){
					var pSourcePoint = value.datas[0]._location;
					var pSourcePoi = value.datas[0].poiid;
					
					self.directionUtil.gaodeweb_GetWalkingData(pSourcePoint,pTargetPoint,pFuncDoDistance,null,[pSourcePoint,pSourcePoi,0]);
				});
				
				
				
			},
			function(pUserData, pUserBattleArray, pDestPoiData, pSourcePoiDatas, pAllDrivingData, callback){
				console.log("6 calcate attack!!!");

				// 1 目标点设置处于战斗状态。
				pDestPoiData.datas[0].battlestatus = 1;// 目标点
				self.mycache_SetPoiData(msg.destpoiid,JSON.stringify(pDestPoiData));
				// 2 源点设置处于战斗状态。
				pSourcePoiDatas.forEach(function(value, key, map){
					value.datas[0].battlestatus = 2;// 源点
					if(key == null){
						console.log("poi key is null",value);
						return;
					}
					self.mycache_SetPoiData(key,JSON.stringify(value));
				});
				// 3 缓存下这个战斗信息
				var pBattleData = {};
				pBattleData.distance = pAllDrivingData;
				pBattleData.targetid = pDestPoiData.datas[0].poiid;
				pBattleData.targetpos = pDestPoiData.datas[0]._location;
				pBattleData.targetname = pDestPoiData.datas[0]._name;
				pBattleData.isover = 0; // is battle all over??
				pBattleData.sourceids = new Array(pSourcePoiDatas.size);
				pBattleData.sourceposs = new Array(pSourcePoiDatas.size);
				pBattleData.sourcenames = new Array(pSourcePoiDatas.size);
				var i = 0;
				pSourcePoiDatas.forEach(function(value, key, map){
					pBattleData.sourceids[i] = key;
					pBattleData.sourceposs[i] = value.datas[0]._location;
					pBattleData.sourcenames[i] = value.datas[0]._name;
					i++;
				});
				pBattleData.begintime = self.commonutil.getDateTimeNumber();
// 				console.log("pUserData->",pUserData);
// 				console.log("pDestPoiData->",pDestPoiData);
				var pKey_OneBattle = self.rediscl.pRedisKeys.key_userid_poiid_battle(pUserData.datas[0]._id,pDestPoiData.datas[0]._id);
				self.rediscl.setDataByKey(pKey_OneBattle,JSON.stringify(pBattleData));
				
				// 4 缓存userid对应战斗key
				var bHasInsert = false;
				for(var i = 0; i < pUserBattleArray.length; ++ i){
					if(pUserBattleArray[i] == pKey_OneBattle){
						bHasInsert = true;
						break;
					}
				}
				if(bHasInsert == false){
					pUserBattleArray.push(pKey_OneBattle);
					var pSendData = JSON.stringify(pUserBattleArray);
					var pKey_userid2battlekey = self.rediscl.pRedisKeys.key_userid_battlekey(pUserData.datas[0]._id);
					self.rediscl.setDataByKey(pKey_userid2battlekey,pSendData);
				}
				
				
				// 5 update battle time
				var bAlreadyPush = false;
				var nFindIndex = -1;
				for(var i = 0; i < self.pScheduleUserIds.length; ++ i){
					if(self.pScheduleUserIds[i][0] == pUserData.datas[0]._id){
						bAlreadyPush = true;
						nFindIndex = i;
						break;
					}
				}
				if(bAlreadyPush == false){
					// [0:userid,1:all over?]
					self.pScheduleUserIds.push([pUserData.datas[0]._id,0]);
					nFindIndex = self.pScheduleUserIds.length - 1;
				}else{
					self.pScheduleUserIds[nFindIndex][1] = 0;
				}

				if(self.pScheduleJobId <= 0){
					self.pScheduleJobId = myScheduler.scheduleJob({
						start:Date.now(), 
						period:3000
						}, 
						self.loopfunc_updateBattle, 
						{owner: self}
					);
				}
				
				// 回应客户端。。。包含当前这个战斗的数据
				return callback(null, JSON.stringify(pBattleData));
			},
		],
		function(err, result) {
			if(err !== null){
				return next(null,{code:err,msg:result});
			} else {
				return next(null,{code:200,msg:result});
			}
		}
	);
};

// 得到用户的当前战斗数据。
Handler.prototype.req_getUserBattleData = function(msg,session,next) {
	if(msg.acckey === undefined)
	{
		console.log('Not Find "AccKey"');
		next(null, {code: 201, msg: 'Not Defined AccKey'});
		return;
	}
	if(msg.username === undefined)
	{
		console.log('Not Find "username"');
		next(null, {code: 201, msg: 'Not Defined username'});
		return;
	}
	var self = this;

	myasync.waterfall(
		[
			function(callback) {
				console.log("1 check user right!!!");
				self.mycache_GetUserData(msg.username,function(szResult,pUserData){
					if (szResult != "success") {
						console.log('Not Find User:->',msg.username);
						return callback(202,'Not Find User');
					}
					if (szResult == "success") {
						if (msg.acckey != pUserData.datas[0].loginkey) {
							return callback(203,'Acckey Is Error');
						}
					}
					return callback(null, pUserData);	
				});
			},
			function(pUserData, callback) {
				console.log("2 get users battle key");
				var pUserBattleKeyArray = [];
				var pKey_userid2battlekey = self.rediscl.pRedisKeys.key_userid_battlekey(pUserData.datas[0]._id);
				self.rediscl.getDataByKey(pKey_userid2battlekey,0,function(sErr,sData){
					if(sErr != null || sData == null){
						// 无数据
						pUserBattleKeyArray = [];
					}else{
						// 还有旧数据
						pUserBattleKeyArray = JSON.parse(sData);
						// todo 需要检测下对应的战斗是否已结束
						
					}
					return callback(null,pUserData,pUserBattleKeyArray);
				});
			},
			function(pUserData, pUserBattleKeyArray, callback) {
				console.log("3 get users battle data");
				
				var pAllData = [];
				if(pUserBattleKeyArray.length == 0){
					return callback(null,JSON.stringify(pAllData));
				}
				for(var i = 0; i < pUserBattleKeyArray.length; ++ i){
					
					self.rediscl.getDataByKey(pUserBattleKeyArray[i],i,function(sErr,sData){
						if(sErr != null || sData == null){
							// 无数据
							return callback(204,'Not Find Battle Data');
						}
						
						
						pAllData.push(JSON.parse(sData));
						// todo 需要检测下对应的战斗是否已结束
						if(pAllData.length >= pUserBattleKeyArray.length){
// 							console.log("Get User Battle Data Ok:->",pAllData);
							return callback(null,JSON.stringify(pAllData));
						}
					});
				}
			},
		],
		function(err, result) {
				if(err !== null){
					return next(null,{code:err,msg:result});
				} else {
					return next(null,{code:200,msg:result});
				}
			}
		);
};

