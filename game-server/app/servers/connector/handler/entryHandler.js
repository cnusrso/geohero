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

var myasync = require("async");
// myasync.waterfall(
// 	[
// 		function(callback) {
// 			console.log("step one!!!");
// 			callback(null, 'one', 'two');
// 		},
// 		function(arg1, arg2, callback) {
// 			console.log("step two!!!");
// 			callback(null, 'three');
// 		},
// 		function(arg1, callback) {
// 			console.log("step three!!!");
// 			callback(null, 'done');
// 		}
// 	],
// 	function(err, result) {
// 		console.log("waterfall over:->",result);
// 	}
// );

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
		//console.log("pTable_baseinfo",pTable_baseinfo);
		pTable_monster = myBabyParse.parseFiles(process.cwd()+"/../shared/tables/monster.txt",{comments:true});
		//console.log("pTable_monster",pTable_monster);
	}

// some func for tables;
function myTable_GetLineById(pTableData,nId){
	for (var j=0;j<pTableData.length;j++){
		var element = pTableData[j];
		// maybe all id index is 0
		if(element[0] == nId){
				return element;
			}
	}
	return [];
}

function myTable_GetLineValue(pLineData,pTableIndex,sIndexName){
	var nIndex = pTableIndex.get(sIndexName);
	return pLineData[nIndex];
}

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

function myTable_RandomOneMonsterByBaseIndex(nIndex){
	var index_id = t_baseinfo.get("index");
	var monsterids_id = t_baseinfo.get("monsterids");
	var mindex_id = t_monster.get("index");
	
	for (var i=0;i<pTable_baseinfo.data.length;i++){
		var element = pTable_baseinfo.data[i];
		var nCurIndex = parseInt(element[index_id]);
		if(nCurIndex == nIndex){
			var strMonsterids = element[monsterids_id];
			var pMonsterIds = strMonsterids.split("#");
			
			var nRandomIndex = Math.floor(Math.random() * pMonsterIds.length);			
			var nRandomMonsterIndex = pMonsterIds[nRandomIndex];
			for (var j=0;j<pTable_monster.data.length;j++){
				if(pTable_monster.data[j][mindex_id] == nRandomMonsterIndex){	
					return {
						id:nRandomMonsterIndex,
						name:pTable_monster.data[j][t_monster.get("name")],
						hp:pTable_monster.data[j][t_monster.get("hp")],
						award:pTable_monster.data[j][t_monster.get("award")],
						icon:pTable_monster.data[j][t_monster.get("icon")]
					};
				}
			}
		}
	}
	return {};	
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

var sGaodeWebServiceKey = '957606db3c3518da4a5dda76d1641008';
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
// 预定义所用的key...

var pRedisKeys = {
	key_poiid_data:function(poiid){return "poiid:"+poiid.toString()+":data"},
	key_poitypeid_extdata:function(typeid){return "poitypeid:"+typeid.toString()+":extdata"},
	key_poitypetext_extdata:function(typetext){return "poitypetext:"+typetext.toString()+":extdata"},
	
	key_userid_pois:function(userid){return "userid:"+userid.toString()+":pois";},
	key_userid_pois_dirty:function(userid){return "userid:"+userid.toString()+":pois:dirty";},
	key_userid_data:function(userid){return "userid:"+userid.toString()+":data"},
	key_username_data:function(name){return "username:"+name+":data"},	
	
	key_userid_poiid_battle:function(userid,destpoiid){return "userid:"+userid.toString()+":poiid:"+destpoiid.toString()+":battle"},
	key_userid_battlekey:function(userid){return "userid:"+userid.toString()+":battlekey"},
};

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

// begin gaode web api function .........................................................

function gaodeweb_GetDistanceData(pSourcePoints,pTargetPoint,funcCallback,pCallOwner){
	var sHttpGetHead = "http://restapi.amap.com/v3/distance?";
	var sSig = myfun_crypto("destination="+pTargetPoint+"&key="+sGaodeWebServiceKey+"&origins="+pSourcePoints+sPrivateKey);
	var sFullURL = sHttpGetHead+"origins="+pSourcePoints+"&destination="+pTargetPoint+"&key="+sGaodeWebServiceKey+"&sig="+sSig;
	myrequest(sFullURL, function(error, response, body) {
		var nResult = 0;
		if (!error && response.statusCode == 200) {
				nResult = 0;
		} else {
			console.log("gaodeweb_GetDistanceData failed:->",error, response, body);
			nResult = 1;
		}
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, nResult, body);
		} else if (funcCallback != null) {
			funcCallback(nResult, body);
		}
	});
}

// end gaode web api function ..............................................................

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


// warp self cache function ...........................................................
function mycache_SetPoiData(szPoiId,sData){
	var pkey = pRedisKeys.key_poiid_data(szPoiId);
	redis_SetDataByKey(pkey,sData);
}
function mycache_GetPoiData(szPoiId, funcCallback, pCallOwner) {
	var pkey = pRedisKeys.key_poiid_data(szPoiId);
	redis_GetDataByKey(pkey,function(sErr,sData){
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
						mycache_SetPoiData(szPoiId,sBody);
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

function mycache_SetUserPois(nUserId,sData){
	var sKey = pRedisKeys.key_userid_pois(nUserId);
	redis_SetDataByKey(sKey,sData);
}
function mycache_GetUserPois(nUserId, funcCallback, pCallOwner) {
	// 强制从库中更新数据方法
	var pfunForceUpdate = function(){
		var sFilter = "ownerid:"+nUserId;
		yuntu_GetDataByFilter(sTable_t_poi,sFilter,function(nResult,sBody){
			var szResult = "";
			var pResult = {};
			console.log("again get user pois->",nResult,sBody);
			if(nResult == 1){
				pResult = JSON.parse(sBody);
				szResult = "success";
				mycache_SetUserPois(nUserId,sBody);
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
		var sKey = pRedisKeys.key_userid_pois(nUserId);
		redis_GetDataByKey(sKey,function(sErr,sData){
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
	var sKeyDirty = pRedisKeys.key_userid_pois_dirty(nUserId);
	redis_GetDataByKey(sKeyDirty,function(sErr,sData){
		if(sErr != null || sData == null){
			pfunGetData();
		} else {
			if(sData == "1"){
				redis_SetDataByKey(sKeyDirty,"0");
				pfunForceUpdate();
			} else {
				pfunGetData();
			}
		}
	});
}

function mycache_SetUserData(szUserName,sData){
	var sKey = pRedisKeys.key_username_data(szUserName);
	redis_SetDataByKey(sKey,sData);
}
function mycache_GetUserData(szUserName, funcCallback, pCallOwner) {
	var sKey = pRedisKeys.key_username_data(szUserName);
	redis_GetDataByKey(sKey,function(sErr,sData){
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
						mycache_SetUserData(szUserName,sBody);
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

function mycache_SetDataByUserId(nId, sData){
	var sKey = pRedisKeys.key_userid_data(nId);
	redis_SetDataByKey(sKey,sData);
}
function mycache_GetDataByUserId(nId, funcCallback, pCallOwner) {
	var sKey = pRedisKeys.key_userid_data(nId);
	redis_GetDataByKey(sKey,function(sErr,sData){
		if(sErr != null || sData == null){
			// user not in redis,get it from db
			var sFilter = "_id:"+nId;
			yuntu_GetDataByFilter(sTable_t_account,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				if(nResult == 1){
					pResult = JSON.parse(sBody);
					if (pResult.count == 1) {
						// only one account is ok
						szResult = "success";
						// cache this user's value.
						mycache_SetDataByUserId(nId,sBody);
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

function mycache_SetExtDataByPoiTypeText(typetext, sData){
	var sKey = pRedisKeys.key_poitypetext_extdata(typetext);
	redis_SetDataByKey(sKey,sData);
}
function mycache_GetExtDataByPoiTypeText(typetext, funcCallback, pCallOwner) {
	var sKey = pRedisKeys.key_poitypetext_extdata(typetext);
	redis_GetDataByKey(sKey,function(sErr,sData){
		var pExtData = {};
		var szResult = "";
		if(sErr != null || sData == null){
			var nBaseIndex = myTable_GetBaseIndexByTypeText(typetext);
			var nBaseCost = myTable_GetBaseCostByIndex(nBaseIndex);
			pExtData.basetypeindex = nBaseIndex;
			pExtData.basecost = nBaseCost;
			var pMonsterNames = myTable_GetMaybeMonsterNamesByBaseIndex(pExtData.basetypeindex);
			pExtData.monstername = pMonsterNames;

			// 以类型名和类型ID缓存表数据
			mycache_SetExtDataByPoiTypeText(typetext,JSON.stringify(pExtData));
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





var Handler = function(app) {
  this.app = app;
};

module.exports = function(app) { 
  return new Handler(app);
};

var onUserLeave = function (username, session) {
  if (session && session.uid) {
		console.log("user leave",session.uid);
		redis_DelDataByKey(username);
  }
};

Handler.prototype.OnExit = function(){
	console.log("entryhandler receive exit!!!");
	myrediscl.set('exit_time',myfun_getDateTimeStr());
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
	mycache_GetUserData(msg.username,function(szResult,pUserData){
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
	mycache_GetUserData(msg.username,function(szResult,pUserData){
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
							mycache_SetUserData(msg.username,JSON.stringify(pUserData));
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
	
	mycache_GetUserData(msg.username,function(szResult,pUserData){
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
	
	mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {code: 203,	msg: 'AccKey Is Error'});
				return;
			}
			
			// find all poi by user id
			mycache_GetUserPois(pUserData.datas[0]._id,function(szResult,pPoisData){
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
	
	mycache_GetUserData(msg.username,function(szResult,pUserData){
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
						mycache_SetUserData(msg.username, JSON.stringify(pUserData));
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
	
	
	mycache_GetUserData(msg.username,function(szResult,pUserData){
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
						mycache_SetUserData(msg.username,JSON.stringify(pUserData));
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
	
	
	mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
			mycache_GetPoiData(msg.poiid,function(szResult,pPoiData){
				var pExtData = {};
				var sCurPoiTypeText = msg.poitypetext;
				if(sCurPoiTypeText === ""){// poi 类型是空的时候
					sCurPoiTypeText = "null";
				}
				var key1 = pRedisKeys.key_poitypetext_extdata(encodeURI(sCurPoiTypeText));
				redis_GetDataByKey(key1,function(sErr,sData){
					if(sErr != null || sData == null){
						var nBaseIndex = myTable_GetBaseIndexByTypeText(sCurPoiTypeText);
						var nBaseCost = myTable_GetBaseCostByIndex(nBaseIndex);
						pExtData.basetypeindex = nBaseIndex;
						pExtData.basecost = nBaseCost;
						var pMonsterNames = myTable_GetMaybeMonsterNamesByBaseIndex(pExtData.basetypeindex);
						pExtData.monstername = pMonsterNames;
						
						// 以类型名和类型ID缓存表数据
						redis_SetDataByKey(key1,JSON.stringify(pExtData));
						var key2 = pRedisKeys.key_poitypeid_extdata(nBaseIndex);
						redis_SetDataByKey(key2,JSON.stringify(pExtData));
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

							var pLineData = myTable_GetLineById(pTable_monster.data,parseInt(pmonsterdata.id));
							pmonsterdata.name = myTable_GetLineValue(pLineData,t_monster,"name");
							pmonsterdata.maxhp = myTable_GetLineValue(pLineData,t_monster,"hp");
							pmonsterdata.award = myTable_GetLineValue(pLineData,t_monster,"award");
							pmonsterdata.icon = myTable_GetLineValue(pLineData,t_monster,"icon");

							

							mycache_GetDataByUserId(pPoiData.datas[0].ownerid,function(szResultOwner,pUserDataOwner){
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
	
	
	mycache_GetUserData(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			if (msg.acckey != pUserData.datas[0].loginkey) {
				next(null, {
					code: 203,
					msg: 'AccKey Is Error'
				});
				return;
			}
			
			mycache_GetPoiData(msg.poiid,function(szResult,pPoiData){
				
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
				var key1 = pRedisKeys.key_poitypeid_extdata(msg.poitypeid);
				redis_GetDataByKey(key1,function(sErr,sData){
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
					mycache_SetUserData(msg.username,JSON.stringify(pUserData));
					
					// 更新用户的钱入库
					var pInsertData = {
						_id:pUserData.datas[0]._id,
						money:pNewMoney,
						loginkey:msg.acckey
					};
					var pData = JSON.stringify(pInsertData);
					yuntu_UpdateNewData(sTable_t_account,pData,function(nResult,sData){
						if(nResult == 1){
							var pResult = JSON.parse(sData);
							if(pResult.status == 1)	{
								// 随机产生一个怪数据
								var pNewMonsterData = myTable_RandomOneMonsterByBaseIndex(pExtData.basetypeindex);

								// 进行占领操作
								var nCurTime = myfun_getDateTimeNumber();
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
									yuntu_UpdateNewData(sTable_t_poi,pData,function(nResult,pResultBody){
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
												mycache_SetPoiData(msg.poiid,JSON.stringify(pPoiData));
												
												// 标记user对应的pois数据有变化
												var sKeyDirty = pRedisKeys.key_userid_pois_dirty(pUserData.datas[0]._id);
												redis_SetDataByKey(sKeyDirty,"1");
												
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
									yuntu_AddNewData(sTable_t_poi,pData,function(nResult,pResultBody){
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
												mycache_SetPoiData(msg.poiid,JSON.stringify(pPoiData));
												
												// 标记user对应的pois数据有变化
												var sKeyDirty = pRedisKeys.key_userid_pois_dirty(pUserData.datas[0]._id);
												redis_SetDataByKey(sKeyDirty,"1");
												
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
	
	myasync.waterfall(
		[
			function(callback) {
				console.log("1 check user right!!!");
				mycache_GetUserData(msg.username,function(szResult,pUserData){
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
				var pKey_userid2battlekey = pRedisKeys.key_userid_battlekey(pUserData.datas[0]._id);
				redis_GetDataByKey(pKey_userid2battlekey,function(sErr,sData){
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
				mycache_GetPoiData(msg.destpoiid,function(szResult,pDestPoiData){
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
					mycache_GetPoiData(msg.sourcepoiids[i],function(szResult,pSourcePoiData){
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
				console.log("5 calcate distance data!!!");
				var pSourcePoints = "";
				pSourcePoiDatas.forEach(function(value, key, map){
					pSourcePoints = pSourcePoints+value.datas[0]._location+"|";
				});
				var pTargetPoint = pDestPoiData.datas[0]._location;
				
				var pFuncDoDistance = function(nResult,sBody){
					if(nResult !== 0){
						return callback(213,'Web Error Get Distance Data');
					}
					var pDistanceData = JSON.parse(sBody);
					if(pDistanceData.status != 1){
						// 请求失败
						console.log("Request Distance Error,info:->"+pDistanceData.info+" infocode:->"+pDistanceData.infocode);
						
						// 再请求？？
						return gaodeweb_GetDistanceData(pSourcePoints,pTargetPoint,pFuncDoDistance);
					}
					return callback(null, pUserData, pUserBattleArray, pDestPoiData,pSourcePoiDatas,pDistanceData);
				};
				gaodeweb_GetDistanceData(pSourcePoints,pTargetPoint,pFuncDoDistance);
				
			},
			function(pUserData, pUserBattleArray, pDestPoiData, pSourcePoiDatas, pDistanceData, callback){
				console.log("6 calcate attack!!!");

				// 1 目标点设置处于战斗状态。
				pDestPoiData.datas[0].battlestatus = 1;// 目标点
				mycache_SetPoiData(msg.destpoiid,JSON.stringify(pDestPoiData));
				// 2 源点设置处于战斗状态。
				pSourcePoiDatas.forEach(function(value, key, map){
					value.datas[0].battlestatus = 2;// 源点
					mycache_SetPoiData(key,JSON.stringify(value));
				});
				// 3 缓存下这个战斗信息
				var pBattleData = {};
				pBattleData.distance = pDistanceData;
				pBattleData.targetid = pDestPoiData.datas[0].poiid;
				pBattleData.targetpos = pDestPoiData.datas[0]._location;
				pBattleData.targetname = pDestPoiData.datas[0]._name;
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
				pBattleData.begintime = myfun_getDateTimeNumber();
// 				console.log("pUserData->",pUserData);
// 				console.log("pDestPoiData->",pDestPoiData);
				var pKey_OneBattle = pRedisKeys.key_userid_poiid_battle(pUserData.datas[0]._id,pDestPoiData.datas[0]._id);
				redis_SetDataByKey(pKey_OneBattle,JSON.stringify(pBattleData));
				
				// 4 缓存userid对应战斗id
				var pKey_userid2battlekey = pRedisKeys.key_userid_battlekey(pUserData.datas[0]._id);
				pUserBattleArray.push(pKey_OneBattle);
				redis_SetDataByKey(pKey_userid2battlekey,JSON.stringify(pUserBattleArray));
				
				
				
				// 回应客户端。。。
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

	myasync.waterfall(
		[
			function(callback) {
				console.log("1 check user right!!!");
				mycache_GetUserData(msg.username,function(szResult,pUserData){
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
				var pKey_userid2battlekey = pRedisKeys.key_userid_battlekey(pUserData.datas[0]._id);
				redis_GetDataByKey(pKey_userid2battlekey,function(sErr,sData){
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
					
					redis_GetDataByKey(pUserBattleKeyArray[i],function(sErr,sData){
						if(sErr != null || sData == null){
							// 无数据
							return callback(204,'Not Find Battle Data');
						}
						
						
						pAllData.push(JSON.parse(sData));
						// todo 需要检测下对应的战斗是否已结束
						if(pAllData.length >= pUserBattleKeyArray.length){
							console.log("Get User Battle Data Ok:->",pAllData);
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

