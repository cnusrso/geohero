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

// test csv parse...
if(0)
	{
		var pCSV = myBabyParse.parse("INT	FLOAT	STRING\n#ID	SPEED	NAME\n0	2.3	abcd\n",{comments:true});
		console.log("aaaaaaaaaaaaaaaaaaaaaaa",pCSV);
	}


AWS.config.loadFromPath('./config/aws-config_testuser1.json');
var dynamodb = new AWS.DynamoDB();

var crypto = require('crypto');
function myfun_crypto (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

var sKey = '957606db3c3518da4a5dda76d1641008';
var sYunTuKey = '957606db3c3518da4a5dda76d1641008';
var sPrivateKey = 'b6e5a1d7de8220063267663c21e6e171';
var sTable_t_account = '57067e02305a2a034b260fa2';

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
function redis_SetDataByUserName(szUserName,sData) {
	myrediscl.set(szUserName,sData);
}
function redis_GetDataByUserName(szUserName,funcCallback,pCallOwner) {
	myrediscl.get(szUserName, function(err, reply) {
		console.log("find user name result:->",szUserName,err,reply);
		
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, err, reply);
		} else if (funcCallback != null) {
			funcCallback(err, reply);
		}
	});
}
function redis_DelDataByUserName(szUserName){
	myrediscl.del(szUserName);
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



function check_HasUser(szUserName, funcCallback, pCallOwner) {
	redis_GetDataByUserName(szUserName,function(sErr,sData){
		if(sErr != null || sData == null){
			// user not in redis,get it from db
			var sFilter = "account:"+szUserName;
			yuntu_GetDataByFilter(sTable_t_account,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				
				if(nResult == 1){
					pResult = eval("(" + sBody + ")");
					if (pResult.count == 1) {
						// only one account is ok
						szResult = "success";
						// cache this user's value.
						redis_SetDataByUserName(szUserName,sBody);
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
			var pResult = eval("(" + sData + ")");
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
		redis_DelDataByUserName(username);
  }
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
	var sHttpGetHead = "http://yuntuapi.amap.com/datamanage/data/list?";
	var sTableid = sTable_t_account;
	var sFilter = "account:"+msg.username;
	var sSig = myfun_crypto("filter="+sFilter+"&key="+sKey+"&tableid="+sTableid+sPrivateKey);
	var sFullURL = sHttpGetHead+"tableid="+sTableid+"&filter="+sFilter+"&key="+sKey+"&sig="+sSig;
	//http://yuntuapi.amap.com/datamanage/data/list?tableid=57067e02305a2a034b260fa2&filter=account:cnusrso&key=957606db3c3518da4a5dda76d1641008&sig=3f8746fb740d081e3a654c07ff333c32
	myrequest(sFullURL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var pResult = eval("(" + body + ")");
			if (pResult.count >= 1) {
					next(null, {
						code: 204,
						account: msg.username,
						msg: 'Has User'
					});
				
			} else {
				// not find user can regist
				sHttpGetHead = 'http://yuntuapi.amap.com/datamanage/data/create';
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
				sSig = myfun_crypto("data="+pData+"&key="+sKey+"&loctype=1&tableid="+sTableid+sPrivateKey);
				
				// do regist
				myrequest.post(
					{
						url:sHttpGetHead, 
						form:{
							key:sKey,
							loctype:1,
							tableid:sTableid,
							data:pData,
							sig:sSig
						},
					}, 
					function(err,httpResponse,body)
					{
						if (!error && response.statusCode == 200) {
							
							console.log("body:",body);
							pResult = eval("(" + body + ")");
							if(pResult.status == 1)
								{
									// regist ok
									next(null, {
										code: 200,
										account: msg.username,
										msg: szAccKey
									});
								}
							else
								{
									next(null, {
										code: 205,
										account: msg.username,
										msg: pResult.info
									});
								}
						}
					}
				);
			}
		} else {
			
			next(null, {
				code: 206,
				account: msg.username,
				msg: 'amap yuntuapi response->' + response.statusCode
			});
		}
	})
	
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
	
	// check same user login again...
	var sessionService = this.app.get('sessionService');
	var oldSession = sessionService.getByUid(msg.username);
// 	console.log("oldSessionoldSessionoldSession",oldSession)
	var self = this;
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
	
	// get this user data
	check_HasUser(msg.username,function(szResult,pUserData){
		if (szResult == "success") {
			
			var sStorePwd = myfun_BuildEndPassword(msg.username, msg.password);
			if (sStorePwd == pUserData.datas[0].password) {

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
						var pResult = eval("(" + sData + ")");
						if(pResult.status == 1)	{
							// update key ok, response client
							next(null, {
								code: 200,
								account: msg.username,
								msg: szAccKey
							});
							// update redis data
							pUserData.datas[0].loginkey = pInsertData.loginkey;
							redis_SetDataByUserName(msg.username,JSON.stringify(pUserData));
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
			
//  				console.log("msg->",msg)
				// update position and name
				var sHttpPostHead = "http://yuntuapi.amap.com/datamanage/data/update";
				var szlocation=msg.poslng+','+msg.poslat;
				var pInsertData = {
					_id:pUserData.datas[0]._id,
					_name: '1',//msg.name.toString(),
					_location:szlocation
				};
				var pData = JSON.stringify(pInsertData);
				console.log("pData:",pData);
				var sTableid = sTable_t_account;
				sSig = myfun_crypto("data="+pData+"&key="+sKey+"&loctype=1&tableid="+sTableid+sPrivateKey);
				// update position..
				myrequest.post(
					{
						url:sHttpPostHead,
						headers: [
							{
								name: 'content-type',
								value: 'application/x-www-form-urlencoded'
							}
						],
						form:{
							key:sKey,
							loctype:1,
							tableid:sTableid,
							data:pData,
							sig:sSig
						},
					}, 
					function(error,response,body)
					{
						if (!error && response.statusCode == 200) {

							console.log("update body:",body);
							var pResult = eval("(" + body + ")");
							if(pResult.status == 1)
								{
									// update ok, response client
									next(null, {
										code: 200,
										msg: msg.acckey
									});
									// update redis data
									pUserData.datas[0]._name = pInsertData._name;
									pUserData.datas[0]._location = pInsertData._location;
									redis_SetDataByUserName(msg.username,JSON.stringify(pUserData));
								}
							else
								{
									next(null, {
										code: 204,
										msg: pResult.info
									});
								}
						}
					}
				);
			
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
				// update position and name
				var sHttpPostHead = "http://yuntuapi.amap.com/datamanage/data/update";
				var szlocation=msg.poslng+','+msg.poslat;
				var pInsertData = {
					_id:pUserData.datas[0]._id,
					_name: '1',//msg.name.toString(),
					_location:szlocation
				};
				var pData = JSON.stringify(pInsertData);
				console.log("pData:",pData);
				var sTableid = sTable_t_account;
				sSig = myfun_crypto("data="+pData+"&key="+sKey+"&loctype=1&tableid="+sTableid+sPrivateKey);
				// update position..
				myrequest.post(
					{
						url:sHttpPostHead,
						headers: [
							{
								name: 'content-type',
								value: 'application/x-www-form-urlencoded'
							}
						],
						form:{
							key:sKey,
							loctype:1,
							tableid:sTableid,
							data:pData,
							sig:sSig
						},
					}, 
					function(error,response,body)
					{
						if (!error && response.statusCode == 200) {

							console.log("update body:",body);
							var pResult = eval("(" + body + ")");
							if(pResult.status == 1)
								{
									// update ok, response client
									next(null, {
										code: 200,
										msg: msg.acckey
									});
									
									// update user in redis.
									pUserData.datas[0]._name = pInsertData._name;
									pUserData.datas[0]._location = pInsertData._location;
									redis_SetDataByUserName(msg.username,JSON.stringify(pUserData));
								}
							else
								{
									next(null, {
										code: 204,
										msg: pResult.info
									});
								}
						}
					}
				);
			
		} else {
			console.log('Not Find User');
			next(null,{code:203,msg:'Not Find User'});
			return;
		}
	});
	
	
};
