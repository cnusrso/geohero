var AWS = require('aws-sdk');
var myrequest = require('request');
var myredis = require("redis");
var myBabyParse = require("babyparse");

var myrediscl = myredis.createClient();
myrediscl.on("connect", function () {
    console.log("redis client connect start ");
});
myrediscl.on("error", function (err) {
    console.log("redis client Error " + err);
});
// myrediscl.del("userid1");
// myrediscl.get("userid1", function(err, reply) {
//     console.log("aaaaaaaaaaaa",err,typeof(reply),reply);
// });

// begin tables ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// define tables struct...
var pTable_baseinfo = null;
var t_baseinfo = new Map();
t_baseinfo.set("index",0);
t_baseinfo.set("typetext",1);
t_baseinfo.set("cost",2);
t_baseinfo.set("inchptime",3);
t_baseinfo.set("inchpvel",4);
t_baseinfo.set("inclvltime",5);
t_baseinfo.set("inclvlvel",6);
t_baseinfo.set("inclvlrate",7);
t_baseinfo.set("monsterids",8);

var pTable_monster = null;
var t_monster  = new Map();
t_monster.set("index",0);
t_monster.set("name",1);
t_monster.set("hp",2);
t_monster.set("award",3);
t_monster.set("icon",4);

// read tables......
if(1)
	{
		pTable_baseinfo = myBabyParse.parseFiles(process.cwd()+"/../shared/tables/baseinfo.txt",{comments:true});
		console.log("pTable_baseinfo",pTable_baseinfo);
		pTable_monster = myBabyParse.parseFiles(process.cwd()+"/../shared/tables/monster.txt",{comments:true});
		console.log("pTable_monster",pTable_monster);
	}

// some func for tables;
function myTable_GetBaseIndexByTypeText(sType){
	var typetext_id = t_baseinfo.get("typetext");
	for (var j=0;j<pTable_baseinfo.data.length;j++){
		var element = pTable_baseinfo.data[j];
		if(element[typetext_id] == sType){
				var index_id = t_baseinfo.get("index");
				return parseInt(element[index_id]);
			}
	}
	return 0;
}

function myTable_GetBaseCostByIndex(nIndex){
	var index_id = t_baseinfo.get("index");
	for (var i=0;i<pTable_baseinfo.data.length;i++){
		var element = pTable_baseinfo.data[i];
		var nCurIndex = parseInt(element[index_id]);
		if(nCurIndex == nIndex){
			var cost_id = t_baseinfo.get("cost");
			return element[cost_id];
		}
	}
	return 0;
}

function myTable_GetMonsterNameById(nId){
	var index_id = t_monster.get("index");
	for (var j=0;j<pTable_monster.data.length;j++){
		var element = pTable_monster.data[i];
		if(element[index_id] == nId){
			var name_id = t_monster.get("name");
			return element[name_id];
		}
	}
	return "";
}

function myTable_GetMaybeMonsterNamesByBaseIndex(nIndex){
	var index_id = t_baseinfo.get("index");
	for (var i=0;i<pTable_baseinfo.data.length;i++){
		var element = pTable_baseinfo.data[i];
		var nCurIndex = parseInt(element[index_id]);
		if(nCurIndex == nIndex){
			var monsterids_id = t_baseinfo.get("monsterids");
			var strMonsterids = element[monsterids_id];
			var pMonsterIds = strMonsterids.split("#");
			var pMonsterNames = [];
			
			var mindex_id = t_monster.get("index");
			var mname_id = t_monster.get("name");
			pMonsterIds.forEach(function(mm){
				for (var j=0;j<pTable_monster.data.length;j++){
					if(pTable_monster.data[j][mindex_id] == mm){
						pMonsterNames.push(pTable_monster.data[j][mname_id]);
						break;
					}
				}
			});
			return pMonsterNames;
		}
	}
	return [];	
}

// console.log("myTable_GetBaseIndexByTypeText",myTable_GetBaseIndexByTypeText("金融保险服务"));
// console.log("myTable_GetMaybeMonsterNamesByBaseIndex",myTable_GetMaybeMonsterNamesByBaseIndex(1));

// end tables <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<-




AWS.config.loadFromPath('./config/aws-config_testuser1.json');
var dynamodb = new AWS.DynamoDB();

var crypto = require('crypto');
function myfun_crypto (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

var sKey = '957606db3c3518da4a5dda76d1641008';
var sYunTuKey = '957606db3c3518da4a5dda76d1641008';
var sPrivateKey = 'b6e5a1d7de8220063267663c21e6e171';
var sTable_t_account 	= '57067e02305a2a034b260fa2';
var sTable_t_poi			= '570680c6305a2a034b262400';

// build end password
function myfun_BuildEndPassword(sInputUserName,sInputUserPwd)
{
	var sEndPwd = myfun_crypto(sInputUserName+sInputUserPwd);
	sEndPwd = myfun_crypto(sInputUserName+sEndPwd);
	sEndPwd = myfun_crypto(sInputUserName+sEndPwd);
	sEndPwd = myfun_crypto(sInputUserName+sEndPwd);
	sEndPwd = myfun_crypto(sInputUserName+sEndPwd);
	sEndPwd = myfun_crypto(sInputUserName+sEndPwd);
	
	return sEndPwd;
};

function myfun_getDateTimeStr() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

function myfun_getDateTimeNumber() {

    var date = new Date();
	return date.getTime();
}

// begin redis function................................................
function redis_SetDataByKey(szKey,sData) {
	myrediscl.set(szKey,sData);
}
function redis_GetDataByKey(szKey,funcCallback,pCallOwner) {
	myrediscl.get(szKey, function(err, reply) {
// 		console.log("find key result:->",szKey,err,reply);
		
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, err, reply);
		} else if (funcCallback != null) {
			funcCallback(err, reply);
		}
	});
}
function redis_DelDataByKey(szKey){
	myrediscl.del(szKey);
}
// end redis function ...............................................................

// begin yuntu function ................................................................

function yuntu_GetDataByFilter(sTableId,szFilter,funcCallback,pCallOwner){
	var sHttpGetHead = "http://yuntuapi.amap.com/datamanage/data/list?";
	var sSig = myfun_crypto("filter="+szFilter+"&key="+sYunTuKey+"&tableid="+sTableId+sPrivateKey);
	var sFullURL = sHttpGetHead+"tableid="+sTableId+"&filter="+szFilter+"&key="+sYunTuKey+"&sig="+sSig;
	myrequest(sFullURL, function(error, response, body) {
		var nResult = 0;
		if (!error && response.statusCode == 200) {
				nResult = 1;
		} else {
			console.log("yuntuapi list failed:->",error, response, body, sTableId, szFilter);
			nResult = 0;
		}
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, nResult, body);
		} else if (funcCallback != null) {
			funcCallback(nResult, body);
		}
	});
}

function yuntu_UpdateNewData(sTableId,szData,funcCallback,pCallOwner){
	
	var sHttpPostHead = "http://yuntuapi.amap.com/datamanage/data/update";
	var sSig = myfun_crypto("data="+szData+"&key="+sYunTuKey+"&loctype=1&tableid="+sTableId+sPrivateKey);
	myrequest.post(
		{
			url:sHttpPostHead,
			form:{
				key:sYunTuKey,
				loctype:1,
				tableid:sTableId,
				data:szData,
				sig:sSig
			},
		}, 
		function(error,response,body){
			var nResult = 0;			
			if (!error && response.statusCode == 200) {
				nResult = 1;
			} else {
				console.log("yuntuapi update failed:->",error, response, body, sTableId, szData);
				nResult = 0;
			}
			
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, nResult, body);
			} else if (funcCallback != null) {
				funcCallback(nResult, body);
			}
		}
	);
	
}

function yuntu_AddNewData(sTableId,szData,funcCallback,pCallOwner){
	
	var sHttpGetHead = 'http://yuntuapi.amap.com/datamanage/data/create';
	var sSig = myfun_crypto("data="+szData+"&key="+sYunTuKey+"&loctype=1&tableid="+sTableId+sPrivateKey);
	// do regist
	myrequest.post(
		{
			url:sHttpGetHead, 
			form:{
				key:sYunTuKey,
				loctype:1,
				tableid:sTableId,
				data:szData,
				sig:sSig
			},
		}, 
		function(error,response,body) {
			var nResult = 0;			
			if (!error && response.statusCode == 200) {
				nResult = 1;
			} else {
				console.log("yuntuapi create failed:->",error, response, body, sTableId, szData);
				nResult = 0;
			}
			
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, nResult, body);
			} else if (funcCallback != null) {
				funcCallback(nResult, body);
			}
		}
	);
	
}

// end yuntu function .................................................................

function check_HasPoi(szPoiId, funcCallback, pCallOwner) {
	redis_GetDataByKey(szPoiId,function(sErr,sData){
		if(sErr != null || sData == null){
			var sFilter = "poiid:"+szPoiId;
			yuntu_GetDataByFilter(sTable_t_poi,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				if(nResult == 1){
					pResult = JSON.parse(sBody);
					if (pResult.count == 1) {
						// only one poi is ok
						szResult = "success";
						// cache this poi's value.
						redis_SetDataByKey(szPoiId,sBody);
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

function check_HasUser(szUserName, funcCallback, pCallOwner) {
	redis_GetDataByKey(szUserName,function(sErr,sData){
		if(sErr != null || sData == null){
			// user not in redis,get it from db
			var sFilter = "account:"+szUserName;
			yuntu_GetDataByFilter(sTable_t_account,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				
				if(nResult == 1){
					pResult = JSON.parse(sBody);
					if (pResult.count == 1) {
						// only one account is ok
						szResult = "success";
						// cache this user's value.
						redis_SetDataByKey(szUserName,sBody);
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





module.exports = function(app) { 
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};


var onUserLeave = function (username, session) {
  if (session && session.uid) {
		console.log("user leave",session.uid);
		redis_DelDataByKey(username);
  }
};

Handler.prototype.OnExit = function(){
// 	console.log("app exit");
	myrediscl.set('exit time',myfun_getDateTimeStr());
};

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
	// first check has user name...
	check_HasUser(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			// already has this user,can't register
			next(null, {
				code: 204,
				account: msg.username,
				msg: 'Has User'
			});
		} else if(szResult == "failed") {
			// can register
			
			var nCurTime = myfun_getDateTimeNumber();
			var szAccKey = myfun_crypto(msg.username+nCurTime.toString());
			var pInsertData = {
				_name:0,
				_location:"100,31",
				account:msg.username,
				password:myfun_BuildEndPassword(msg.username, msg.password),
				loginkey:szAccKey
			};
			var pData = JSON.stringify(pInsertData);
			yuntu_AddNewData(sTable_t_account,pData,function(nResult,pResultBody){
				
				if (nResult == 1) {
					var pResult = JSON.parse(pResultBody);
					if (pResult.status == 1) {
						// regist ok
						session.bind(msg.username);
						session.on('closed', onUserLeave.bind(null, msg.username));
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
	check_HasUser(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			
			var sStorePwd = myfun_BuildEndPassword(msg.username, msg.password);
			if (sStorePwd == pUserData.datas[0].password) {

				// check same user login again...
				var sessionService = self.app.get('sessionService');
				var oldSession = sessionService.getByUid(msg.username);
				// 	console.log("oldSessionoldSessionoldSession",oldSession)
				if (!!oldSession) {
					sessionService.kick(msg.username, "other login", function() {
						session.bind(msg.username);
						session.on('closed', onUserLeave.bind(null, msg.username));
						session.pushAll();
					});
				} else {
					session.bind(msg.username);
					session.on('closed', onUserLeave.bind(null, msg.username));
					session.pushAll();
				}
				
				// check password ok,then update acckey
				var nCurTime = myfun_getDateTimeNumber();
				var szAccKey = myfun_crypto(msg.username+nCurTime.toString());
				var pInsertData = {
					_id:pUserData.datas[0]._id,
					loginkey:szAccKey
				};
				var pData = JSON.stringify(pInsertData);
				yuntu_UpdateNewData(sTable_t_account,pData,function(nResult,sData){
					if(nResult == 1){
						var pResult = JSON.parse(sData);
						if(pResult.status == 1)	{
							// update key ok, response client
							next(null, {
								code: 200,
								account: msg.username,
								msg: szAccKey
							});
							// update redis data
							pUserData.datas[0].loginkey = pInsertData.loginkey;
							redis_SetDataByKey(msg.username,JSON.stringify(pUserData));
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
	
	check_HasUser(msg.username,function(szResult,pUserData){
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
	
	check_HasUser(msg.username,function(szResult,pUserData){
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
			yuntu_UpdateNewData(sTable_t_account,pData,function(nResult,sData){
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
						redis_SetDataByKey(msg.username, JSON.stringify(pUserData));
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
	
	
	check_HasUser(msg.username,function(szResult,pUserData){
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
			yuntu_UpdateNewData(sTable_t_account,pData,function(nResult,sData){
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
						redis_SetDataByKey(msg.username,JSON.stringify(pUserData));
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
	
	
	check_HasUser(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
			
			check_HasPoi(msg.poiid,function(szResult,pPoiData){
				
				var pExtData = {};
				if(msg.poitypetext === ""){
					pExtData.basetypeindex = 0;
					pExtData.monstername="";
					
					if(szResult == "success"){
						console.log("poi data:->",pPoiData);
						next(null, {
								code: 200,
								msg: JSON.stringify(pPoiData),
								ext: JSON.stringify(pExtData)
							});
					} else {
						console.log('Not Find Poi',szResult,pExtData);
						next(null,{code:201,msg:'Not Find Poi->'+szResult,ext: JSON.stringify(pExtData)});
						return;
					}
				}else{
					var key1 = msg.poitypetext+"_data";
					redis_GetDataByKey(key1,function(sErr,sData){
						if(sErr != null || sData == null){
							var nBaseIndex = myTable_GetBaseIndexByTypeText(msg.poitypetext);
							var nBaseCost = myTable_GetBaseCostByIndex(nBaseIndex);
							pExtData.basetypeindex = nBaseIndex;
							pExtData.basecost = nBaseCost;
							var pMonsterNames = myTable_GetMaybeMonsterNamesByBaseIndex(pExtData.basetypeindex);
							pExtData.monstername = pMonsterNames;
							
							redis_SetDataByKey(key1,JSON.stringify(pExtData));
						}else{
							pExtData = JSON.parse(sData);
						}
						if(szResult == "success"){
							console.log("poi data:->",pPoiData);
							next(null, {
									code: 200,
									msg: JSON.stringify(pPoiData),
									ext: JSON.stringify(pExtData)
								});
						} else {
							console.log('Not Find Poi',szResult,pExtData);
							next(null,{code:201,msg:'Not Find Poi->'+szResult,ext: JSON.stringify(pExtData)});
							return;
						}
					});
					
				}
				
				
			});
			
		} else {
			console.log('Not Find User');
			next(null,{code:204,msg:'Not Find User'});
			return;
		}
	});
	
	
};
