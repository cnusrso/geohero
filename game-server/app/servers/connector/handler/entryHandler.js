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

function check_HasUser(szFilter, funcCallback, pCallOwner) {
	
	var sHttpGetHead = "http://yuntuapi.amap.com/datamanage/data/list?";
	var sTableid = sTable_t_account;
	var sFilter = szFilter;
	var sSig = myfun_crypto("filter="+sFilter+"&key="+sKey+"&tableid="+sTableid+sPrivateKey);
	var sFullURL = sHttpGetHead+"tableid="+sTableid+"&filter="+sFilter+"&key="+sKey+"&sig="+sSig;
	myrequest(sFullURL, function(error, response, body) {
		var szResult = "";
		var pResult = {};
		if (!error && response.statusCode == 200) {
// 			console.log(body);
			pResult = eval("(" + body + ")");
			if (pResult.count == 1) {
				// only one account is ok
				szResult = "success";
			} else {
				szResult = "failed";	
			}
		} else {
			szResult = "system error";
		}
		
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, szResult,pResult);
		} else if (funcCallback != null) {
			funcCallback(szResult,pResult);
		}
		
	})
}





module.exports = function(app) { 
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
	
	console.log("receive msg:"+msg);
	
	// var params = {
	  // TableName: 't_account1'
	// };
	// dynamodb.describeTable(params, function(err, data) {
	  // if (err)
		// {
			// console.log(err, err.stack); // an error occurred
			// next(null, {code: 200, msg: 'game server is error:'+err});
		// }
	  // else
		// {
			// console.log(data);           // successful response
			// next(null, {code: 200, msg: 'game server is ok:'});
		// }
	// });
	
	// var params = {
	  // ExclusiveStartTableName: 't_account1',
	  // Limit: 10
	// };
	// dynamodb.listTables(params, function(err, data) {
	  // if (err)
		// {
			// console.log(err, err.stack); // an error occurred
			// next(null, {code: 200, msg: 'game server is error:'+err});
		// }
	  // else
		// {
			// console.log(data);           // successful response
			// next(null, {code: 200, msg: 'game server is ok:'});
		// }
	// });
	
	
	// var params = {
		// TableName: 't_account1',
	  // Key: {
		// account: {
			// S: 'user1'
		// }
	  // },
	// };
	// dynamodb.getItem(params, function(err, data) {
	  // if (err) console.log(err, err.stack); // an error occurred
	  // else     console.log(data);           // successful response
	// });
	
	// var params = {
		// TableName: 't_account1',
		// Key: {
			// account: {
				// S: 'user1'
			// },
		// },
		// AttributeUpdates: {
			// password: {
				// Value: {
					// S: "alice@example.com"
				// },
				// Action: "PUT"
			// },
		// },
		// ReturnValues: "ALL_NEW",
	// };
	// dynamodb.updateItem(params, function(err, data) {
	  // if (err) console.log(err, err.stack); // an error occurred
	  // else     console.log(data);           // successful response
	// });
	
	var params = {
		TableName: 't_account1',
		ReturnItemCollectionMetrics: 'SIZE',
		Item: {
			account: {
				S: 'user6'
			},
			password: {
				S:'user4123'
			},
			deviceid: {
				S:'android1'
			},
		},
	};
	dynamodb.putItem(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	});
	
	
	// var params = {
		// TableName:'t_account1',
		// Select:'COUNT',
		// KeyConditions:{
			// account:{
				// ComparisonOperator:'EQ',
				// AttributeValueList:[{S:'user4354'}]
			// },
		// },
	// };
	// dynamodb.query(params, function(err, data) {
	  // if (err) console.log(err, err.stack); // an error occurred
	  // else     console.log(data);           // successful response
	// });
	
	// var params = {
		// TableName:'t_account1',
		// // ScanFilter:{
			// // account:{
				// // ComparisonOperator:'EQ',
				// // AttributeValueList:[
					// // {S:'user1'},
				// // ],
			// // },
		// // },
	// };
	// dynamodb.scan(params, function(err, data) {
	  // if (err) console.log(err, err.stack); // an error occurred
	  // else     console.log(data);           // successful response
	// });

	
};

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
  
  

  next(null, {code: 200, msg: 'publish message is ok,receive: '+msg});
};



/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
  next(null, {code: 200, msg: 'subscribe message is ok.'});
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
	var sHttpGetHead = "http://yuntuapi.amap.com/datamanage/data/list?";
	var sTableid = sTable_t_account;
	var sFilter = "account:"+msg.username;
	var sSig = myfun_crypto("filter="+sFilter+"&key="+sKey+"&tableid="+sTableid+sPrivateKey);
	var sFullURL = sHttpGetHead+"tableid="+sTableid+"&filter="+sFilter+"&key="+sKey+"&sig="+sSig;
	//http://yuntuapi.amap.com/datamanage/data/list?tableid=57067e02305a2a034b260fa2&filter=account:cnusrso&key=957606db3c3518da4a5dda76d1641008&sig=3f8746fb740d081e3a654c07ff333c32
	myrequest(sFullURL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);

			var pResult = eval("(" + body + ")");
			if (pResult.count == 1) {
				var sStorePwd = myfun_BuildEndPassword(msg.username, msg.password);
				if (sStorePwd == pResult.datas[0].password) {
					
					// check password ok,then update acckey
					var sHttpPostHead = "http://yuntuapi.amap.com/datamanage/data/update";
					var nCurTime = myfun_getDateTimeNumber();
					var szAccKey = myfun_crypto(msg.username+nCurTime.toString());
					var pInsertData = {
						_id:pResult.datas[0]._id,
						loginkey:szAccKey
					};
					var pData = JSON.stringify(pInsertData);
					sSig = myfun_crypto("data="+pData+"&key="+sKey+"&loctype=1&tableid="+sTableid+sPrivateKey);
					// update acckey..
					myrequest.post(
						{
							url:sHttpPostHead, 
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

								console.log("update body:",body);
								pResult = eval("(" + body + ")");
								if(pResult.status == 1)
									{
										// update key ok, response client
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
					msg: 'not find user'
				});
			}
		} else {
			next(null, {
				code: 205,
				account: msg.username,
				msg: 'amap yuntuapi response->' + response.statusCode
			});
		}
	})
  
	

};


Handler.prototype.get_UserData = function(msg, session, next) {
	if(msg.acckey === undefined)
	{
		console.log('Not Find "AccKey"');
		next(null, {code: 202, msg: 'Not Defined AccKey'});
		return;
	}
	
	var sHttpGetHead = "http://yuntuapi.amap.com/datamanage/data/list?";
	var sTableid = sTable_t_account;
	var sFilter = "loginkey:"+msg.acckey;
	var sSig = myfun_crypto("filter="+sFilter+"&key="+sKey+"&tableid="+sTableid+sPrivateKey);
	var sFullURL = sHttpGetHead+"tableid="+sTableid+"&filter="+sFilter+"&key="+sKey+"&sig="+sSig;
	console.log(sFullURL);
	myrequest(sFullURL, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);

			var pResult = eval("("+body+")");
			if (pResult.count >= 1) {
				next(null, {code: 200, data:pResult.datas[0]});
			} else {
				// first time failed,try get again
				myrequest(sFullURL,function(erroragain,responseagain,bodyagain){
					console.log("again response:"+body);
					if (!erroragain && responseagain.statusCode == 200) {
						var pResultagain = eval("(" + bodyagain + ")");
						if(pResultagain.count >= 1){// again get userdata success.
							next(null, {code: 200, data:pResultagain.datas[0]});
						}	else {
								next(null,{code:203, msg:'find result->'+pResultagain.count});
						}
					} else {//yuntuapi error???
						next(null, {code: 205, msg: 'amap yuntuapi response->' + pResultagain.statusCode});
					}
				});
			}
		} else {//yuntuapi error???
			next(null, {code: 205, msg: 'amap yuntuapi response->' + response.statusCode});
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
	
	check_HasUser("loginkey:"+msg.acckey,function(szResult,pUserData){
		if (szResult == "success") {
 				console.log("msg->",msg)
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
	console.log("check session",session);
	
	check_HasUser("loginkey:"+msg.acckey,function(szResult,pUserData){
		if (szResult == "success") {
 				console.log("msg->",msg)
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

/*
	desc: sign out from server
	return: 
	code	msg
	200		signin ok, msg's value is acckey
	201 	Not Defined username
	202 	Not Defined password
	203 	not find user
	204 	Failed check password
	205 	system error
	
*/
Handler.prototype.check_SignOut = function(msg, session, next) {

	if(msg.username == undefined)
	{
		console.log("Not Find 'Username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
	else if(msg.acckey == undefined)
	{
		console.log('Not Find "AccessKey"');
		next(null, {code: 202, account: msg.username, msg: 'Not Defined AccessKey'});
		return;
	}
  
	var params = {
		TableName: 't_account1',
	  Key: {
		account: {
			S: msg.username
		},
	  },
	  AttributesToGet:['accesskey'],
	};
	dynamodb.getItem(params, function(err, data) {
		if(err)
		{
			console.log(err, err.stack);
			next(null, {code: 205, account: msg.username, msg: '{"result":"'+err+'"}'});
		}
		else
		{
			console.log(data);
			
			if(data.Item == undefined)
			{
				next(null,{code:203, account: msg.username, msg:'not find user'});
			}
			else
			{
				
				if(data.Item.accesskey.S == msg.acckey)
				{
					// put account to db
					var nCurTime = myfun_getDateTimeNumber();
					
					var params_Save = {
						TableName: 't_account1',
						Key: {
							account: {
								S: msg.username
							},
						},
						AttributeUpdates: {
							accesskey: {
								Value: {
									S: " "
								},
								Action: "PUT"
							},
							intime: {
								Value: {
									S: " "
								},
								Action: "PUT"
							},
							outtime: {
								Value: {
									S: nCurTime.toString()
								},
								Action: "PUT"
							},
						},
					};
					dynamodb.updateItem(params_Save, function(err, data) {
						if (err)
						{
							console.log(err, err.stack); // an error occurred
							next(null, {code: 205, account: msg.username, msg: '{"result":"'+err+'"}'});
						}
						else
						{
							console.log(data);           // successful response
							next(null, {code: 200, account: msg.username, msg: "SignOut Ok"});
						}
					});
				}
				else
				{
					next(null,{code:204, account: msg.username, msg:'Not SignIn'});
				}
			}
		}
	});
};

/*
	return: 
	code	msg
	200		get ok, msg's value is lat and lng,zoom
	201 	Not Defined username
	202 	system error
	203 	not find user
	
*/
Handler.prototype.getLastLatLngByAccount = function(msg, session, next) {

	if(msg.username == undefined)
	{
		console.log("Not Find 'Username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
  
	var params = {
		TableName: 't_lastlatlng',
	  Key: {
		account: {
			S: msg.username
		},
	  },
	  AttributesToGet:['lat','lng','zoom'],
	};
	dynamodb.getItem(params, function(err, data) {
		if(err)
		{
			console.log(err, err.stack);
			next(null, {code: 202, account: msg.username, msg: '{"result":"'+err+'"}'});
		}
		else
		{
			console.log(data);
			
			if(data.Item == undefined)
			{
				next(null,{code:203, account: msg.username, msg:'not find user'});
			}
			else
			{
				var sStorePwd = myfun_BuildEndPassword(msg.username,msg.password);
				
				console.log(data);           // successful response
				next(null, {code: 200, lat: data.Item.lat.N, lng: data.Item.lng.N, zoom: data.Item.zoom.N});
			}
		}
	});
};

/*
	record last lat and lng,zoom by account
	return: 
	code	msg
	200		get ok, msg's value is lat and lng,zoom
	201 	Not Defined username
	202 	system error
	203 	not find user
	
*/
Handler.prototype.setLastLatLngByAccount = function(msg, session, next) {

	if(msg.username == undefined)
	{
		console.log("Not Find 'Username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
	if(msg.lat == undefined)
	{
		console.log("Not Find 'lat'");
		next(null, {code: 202, account: msg.username, msg: 'Not Defined lat'});
		return;
	}
	if(msg.lng == undefined)
	{
		console.log("Not Find 'lng'");
		next(null, {code: 203, account: msg.username, msg: 'Not Defined lng'});
		return;
	}
	if(msg.zoom == undefined)
	{
		console.log("Not Find 'zoom'");
		next(null, {code: 204, account: msg.username, msg: 'Not Defined zoom'});
		return;
	}
	
	
	var params_Query = {
		TableName:'t_lastlatlng',
		Select:'COUNT',
		KeyConditions:{
			account:{
				ComparisonOperator:'EQ',
				AttributeValueList:[{S:msg.username}]
			},
		},
	};
	
	dynamodb.query(params_Query, function(err, data) {
		if(err)
		{
			console.log(err, err.stack);
			next(null, {code: 205, account: msg.username, msg: err});
		}
		else
		{
			console.log(data);           // successful response
			if(data.Count > 0)
			{
				// already has record, update it
				var params_Update = {
					TableName: 't_lastlatlng',
					Key: {
						account: {
							S: msg.username
						},
					},
					AttributeUpdates: {
						lat: {
							Value: {
								N: msg.lat
							},
							Action: "PUT"
						},
						lng: {
							Value: {
								N: msg.lng
							},
							Action: "PUT"
						},
						zoom: {
							Value: {
								N: msg.zoom
							},
							Action: "PUT"
						},
					},
				};
				dynamodb.updateItem(params_Update, function(err, data) {
					if (err)
					{
						console.log(err, err.stack); // an error occurred
						next(null, {code: 206, account: msg.username, msg: '{"result":"'+err+'"}'});
					}
					else
					{
						console.log(data);           // successful response
						next(null, {code: 200, account: msg.username});
					}
				});
			}
			else
			{
				// put new item
				var params_Save = {
					TableName: 't_lastlatlng',
					Item: {
						account: {
							S: msg.username
						},
						lat: {
							N: msg.lat
						},
						lng: {
							N: msg.lng
						},
						zoom: {
							N: msg.zoom
						},
					},
				};
				dynamodb.putItem(params_Save, function(err, data) {
					if (err)
					{
						console.log(err, err.stack); // an error occurred
						next(null, {code: 207, account: msg.username, msg: '{"result":"'+err+'"}'});
					}
					else
					{
						console.log(data);           // successful response
						next(null, {code: 200, account: msg.username});
					}
				});
			}
		}
	});
	
};


/*
	submit postion data
	return: 
	code	msg
	200		submit successful
	201 	Not Defined username
	202 	Not Defined lblat
	203 	Not Defined lblng
	204 	Not Defined rtlat
	205 	Not Defined rtlng
	206 	Not Defined zoom
	207 	scan function error
	208 	putitem function error
	
*/
Handler.prototype.submit_poi = function(msg, session, next) {

	if(msg.username == undefined)
	{
		console.log("Not Find 'Username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
	if(msg.lblat == undefined)
	{
		console.log("Not Find 'lblat'");
		next(null, {code: 202, account: msg.username, msg: 'Not Defined lblat'});
		return;
	}
	if(msg.lblng == undefined)
	{
		console.log("Not Find 'lblng'");
		next(null, {code: 203, account: msg.username, msg: 'Not Defined lblng'});
		return;
	}
	if(msg.rtlat == undefined)
	{
		console.log("Not Find 'rtlat'");
		next(null, {code: 204, account: msg.username, msg: 'Not Defined rtlat'});
		return;
	}
	if(msg.rtlng == undefined)
	{
		console.log("Not Find 'rtlng'");
		next(null, {code: 205, account: msg.username, msg: 'Not Defined rtlng'});
		return;
	}
	if(msg.zoom == undefined)
	{
		console.log("Not Find 'zoom'");
		next(null, {code: 206, account: msg.username, msg: 'Not Defined zoom'});
		return;
	}
	
	var nCurTime = myfun_getDateTimeNumber();
	
	var params_GetCount = {
		TableName: "t_postdata",
		Select: "COUNT",
	};
	
	var nTableCount = 0;

	var tempFuncCountAndPost = function(query) {
		
		dynamodb.scan(query, function(err, data) {
			if (err)
			{
				console.log(err, err.stack); // an error occurred
				next(null, {code: 207, account: msg.username, msg: '{"on scan error":"'+err+'"}'});
				nTableCount = 0;
			}
			else
			{
				nTableCount += Number(data.Count);
				
				if(data.LastEvaluatedKey)
				{
					params_GetCount.ExclusiveStartKey = data.LastEvaluatedKey;
					tempFuncCountAndPost(params_GetCount);
				}
				else
				{
					console.log(data);           // successful response
					var curCount = Number(nTableCount);
					var insertCount = curCount+1;
					
					// put new item
					var params_Save = {
						TableName: 't_postdata',
						Item: {
							timeid: {
								S: insertCount.toString()
							},
							account: {
								S: msg.username
							},
							lblat: {
								N: msg.lblat
							},
							lblng: {
								N: msg.lblng
							},
							rtlat: {
								N: msg.rtlat
							},
							rtlng: {
								N: msg.rtlng
							},
							zoom: {
								N: msg.zoom
							},
							time: {
								S: nCurTime.toString()
							},
						},
					};
					dynamodb.putItem(params_Save, function(err, data) {
						if (err)
						{
							console.log(err, err.stack); // an error occurred
							next(null, {code: 208, account: msg.username, msg: '{"on putitem error":"'+err+'"}'});
						}
						else
						{
							console.log(data);           // successful response
							next(null, {code: 200, account: msg.username, msg:insertCount.toString()});
						}
					});
					
				}
			}
		});
		
	};
	tempFuncCountAndPost(params_GetCount);

};

/*
	return: 
	code	msg
	200		get ok, msg's value is lat and lng,zoom
	201 	Not Defined username
	202 	system error
	203 	not find user
	
*/
Handler.prototype.getNewest10POI = function(msg, session, next) {

	if(msg.username == undefined)
	{
		console.log("Not Find 'Username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
  
	var params_GetCount = {
		TableName: "t_postdata",
		Select: "COUNT",
	};
	
	var nMaxCount = 10;
	var nMinId = 0;
	var pReciveData = new Array();
	var nReciveDataSize = 0;
	
	
	var tempFuncGetPostData = function(id){
		var params = {
			TableName: 't_postdata',
			Key: {
				timeid: {
					S: id.toString()
				},
			},
			AttributesToGet:['timeid','account','lblat','lblng','rtlat','rtlng','zoom','time'],
		};
		dynamodb.getItem(params, function(err, data) {
			if(err)
			{
				console.log(err, err.stack);
				next(null, {code: 205, account: msg.username, msg: err});
			}
			else
			{
				// console.log(data);
				pReciveData[nReciveDataSize] = data;
				nReciveDataSize = nReciveDataSize + 1;
				
				id = id-1;
				if(id >= nMinId)
				{
					tempFuncGetPostData(id);
				}
				else
				{
					// find over
					next(null, {code: 200, size: nReciveDataSize, msg: pReciveData});
				}
			}
		});
	};
	
	
	var nTableCount = 0;
	var tempFuncCountAndPost = function(query) {
		dynamodb.scan(query, function(err, data) {
			if (err)
			{
				console.log(err, err.stack); // an error occurred
				next(null, {code: 207, account: msg.username, msg: '{"on scan error":"'+err+'"}'});
				nTableCount = 0;
			}
			else
			{
				nTableCount += Number(data.Count);
				
				if(data.LastEvaluatedKey)
				{
					params_GetCount.ExclusiveStartKey = data.LastEvaluatedKey;
					tempFuncCountAndPost(params_GetCount);
				}
				else
				{
					// console.log(data);
					
					nMinId = nTableCount - nMaxCount + 1;
					if(nTableCount < nMaxCount)
					{
						nMinId = 1;
					}
					// from top newest to small index get data
					tempFuncGetPostData(nTableCount);
					
				}
			}
		});
	};
	tempFuncCountAndPost(params_GetCount);
	
};







