var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config/aws-config_testuser1.json');
var dynamodb = new AWS.DynamoDB();

var crypto = require('crypto');
function myfun_crypto (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

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
	205 	system error
	
*/
Handler.prototype.check_Register = function(msg,session,next) {
	
	if(msg.username == undefined)
	{
		console.log("Not Find 'username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
	else if(msg.password == undefined)
	{
		console.log('Not Find "password"');
		next(null, {code: 202, account: msg.username, msg: 'Not Defined Password'});
		return;
	}
	
	var params = {
		TableName:'t_account1',
		Select:'COUNT',
		KeyConditions:{
			account:{
				ComparisonOperator:'EQ',
				AttributeValueList:[{S:msg.username}]
			},
		},
	};
	dynamodb.query(params, function(err, data) {
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
				console.log('Has Same Account');
				next(null, {code: 203, account: msg.username, msg: 'Has Same Account'});
			}
			else
			{
				// put account to db
				var nCurTime = myfun_getDateTimeNumber();
				var szAccKey = myfun_crypto(msg.username+nCurTime.toString());
				var sStorePwd = myfun_BuildEndPassword(msg.username,msg.password);
				
				var params_Save = {
					TableName: 't_account1',
					Item: {
						account: {
							S: msg.username
						},
						password: {
							S: sStorePwd
						},
						deviceid: {
							S: msg.deviceid
						},
						accesskey: {
							S: szAccKey
						},
						intime: {
							S: nCurTime.toString()
						},
						outtime: {
							S: " "
						},
					},
				};
				dynamodb.putItem(params_Save, function(err, data) {
					if (err)
					{
						console.log(err, err.stack); // an error occurred
						next(null, {code: 205, account: msg.username, msg: '{"result":"register error"}'});
					}
					else
					{
						console.log(data);           // successful response
						next(null, {code: 200, account: msg.username, msg: szAccKey});
					}
				});
			
			}
		}
	});
	
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

	if(msg.username == undefined)
	{
		console.log("Not Find 'Username'");
		next(null, {code: 201, account: msg.username, msg: 'Not Defined Username'});
		return;
	}
	else if(msg.password == undefined)
	{
		console.log('Not Find "Password"');
		next(null, {code: 202, account: msg.username, msg: 'Not Defined Password'});
		return;
	}
  
	var params = {
		TableName: 't_account1',
	  Key: {
		account: {
			S: msg.username
		},
	  },
	  AttributesToGet:['password'],
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
				var sStorePwd = myfun_BuildEndPassword(msg.username,msg.password);
				
				if(data.Item.password.S == sStorePwd)
				{
					// put account to db
					var nCurTime = myfun_getDateTimeNumber();
					var szAccKey = myfun_crypto(msg.username+nCurTime.toString());
					
					var params_Save = {
						TableName: 't_account1',
						Item: {
							account: {
								S: msg.username
							},
							password: {
								S: sStorePwd
							},
							deviceid: {
								S: msg.deviceid
							},
							accesskey: {
								S: szAccKey
							},
							intime: {
								S: nCurTime.toString()
							},
							outtime: {
								S: " "
							},
						},
					};
					dynamodb.putItem(params_Save, function(err, data) {
						if (err)
						{
							console.log(err, err.stack); // an error occurred
							next(null, {code: 205, account: msg.username, msg: '{"result":"'+err+'"}'});
						}
						else
						{
							console.log(data);           // successful response
							next(null, {code: 200, account: msg.username, msg: szAccKey});
						}
					});
				}
				else
				{
					next(null,{code:204, account: msg.username, msg:'Failed check password'});
				}
			}
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
	200		get ok, msg's value is lat and lng
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
	  AttributesToGet:['lat','lng'],
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
				next(null, {code: 200, lat: data.Item.lat.N, lng: data.Item.lng.N});
			}
		}
	});
};

/*
	record last lat and lng by account
	return: 
	code	msg
	200		get ok, msg's value is lat and lng
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
