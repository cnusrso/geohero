// wrap pomelo...
define(['md5'], {

	bNetConnectOk: false,
	pFuncSystemCallback: null,

	init: function() {
		var singleton = this;

		this.bNetConnectOk = false;

		window.pomelo.on("io-error", function(data) {
// 			_gdata.model_jq('body').unblock();
			singleton.bNetConnectOk = false;
			if(singleton.pFuncSystemCallback != null)
				{
					singleton.pFuncSystemCallback.call(singleton,"io-error",data);
				}
		});
		window.pomelo.on("close", function(data) {
// 			_gdata.model_jq('body').unblock();
			singleton.bNetConnectOk = false;
			if(singleton.pFuncSystemCallback != null)
				{
					singleton.pFuncSystemCallback.call(singleton,"close",data);
				}
		});
		window.pomelo.on("heartbeat timeout", function(data) {
// 			_gdata.model_jq('body').unblock();
			singleton.bNetConnectOk = false;
			if(singleton.pFuncSystemCallback != null)
				{
					singleton.pFuncSystemCallback.call(singleton,"heartbeat timeout",data);
				}
		});
		window.pomelo.on("error", function(data) {
// 			_gdata.model_jq('body').unblock();
			singleton.bNetConnectOk = false;
			if(singleton.pFuncSystemCallback != null)
				{
					singleton.pFuncSystemCallback.call(singleton,"error",data);
				}
		});
		window.pomelo.on("onKick", function(data) {
// 			_gdata.model_jq('body').unblock();
			singleton.bNetConnectOk = false;
			if(singleton.pFuncSystemCallback != null)
				{
					singleton.pFuncSystemCallback.call(singleton,"onKick",data);
				}
		});
		
// 		if (this.bNetConnectOk == false) {
// 			this.connectNet(function(nValue) {
// 				if (nValue == 1) {
// 					this.bNetConnectOk = true;
// 				}
// 			}, this);
// 		}
		


	},
	
	setSystemCallback: function(_pFuncSystemCallback){
		this.pFuncSystemCallback = _pFuncSystemCallback;
	},
	
	connectNet: function(funcCallback,pCallOwner){
		if(pCallOwner == null)
			{
				pCallOwner = this;
			}
		window.pomelo.init({
			host: _gdata.model_datacfg.ServerConfig.ip,
			port: _gdata.model_datacfg.ServerConfig.port,
			log: true
		}, function() {
			console.log("Pomelo Init Ok!",new Date().getTime());
			funcCallback.call(pCallOwner, 1);

		});
	},
	
	disconnectNet: function(){		
		window.pomelo.disconnect();
		this.bNetConnectOk = false;
	},
	
	checkConnect: function(funcCallback,pCallOwner){
		if(pCallOwner == null)
			{
				pCallOwner = this;
			}
		if(this.bNetConnectOk === false)
			{
				this.connectNet(function(nValue){
					if(nValue == 1)
						{
							this.bNetConnectOk = true;
							funcCallback.call(pCallOwner, "reconnect");
						}
				});
			}
		else
			{
				funcCallback.call(pCallOwner, "connect");
			}
	},

	req_check_SignIn: function(username, password, deviceid, funcCallback, pCallOwner) {
		console.log("this.bNetConnectOk",this.bNetConnectOk);
		this.checkConnect(function(szState){
			if(szState == "reconnect")
				{
					this.req_check_SignIn(username, password, deviceid, funcCallback,pCallOwner);
				}
			else if(szState == "connect")
				{
					var pMsg = {};
					pMsg.username = username;
					pMsg.password = CryptoJS.MD5(username + password).toString();
					pMsg.deviceid = deviceid;

					window.pomelo.request("connector.entryHandler.check_SignIn", pMsg, function(data) {

						funcCallback.call(pCallOwner, data);
					});
				}
		},this);
	},

	req_check_Register: function(username, password, deviceid, funcCallback, pCallOwner) {
		this.checkConnect(function(szState){
			if(szState == "reconnect")
				{
					this.req_check_Register(username, password, deviceid, funcCallback, pCallOwner);
				}
			else if(szState == "connect")
				{
					var pMsg = {};
					pMsg.username = username;
					pMsg.password = CryptoJS.MD5(username + password).toString();
					pMsg.deviceid = deviceid;

					window.pomelo.request("connector.entryHandler.check_Register", pMsg, function(data) {

						funcCallback.call(pCallOwner, data);

					});
				}
		},this);
	},
	
	req_getUserData: function(acckey, username,funcCallback, pCallOwner) {
		this.checkConnect(function(szState){
			if(szState == "reconnect")
				{
					this.req_getUserData(acckey, funcCallback,pCallOwner);
				}
			else if(szState == "connect")
				{
					var pMsg = {};
					pMsg.acckey = acckey;
					pMsg.username = username;

					window.pomelo.request("connector.entryHandler.get_UserData", pMsg, function(data) {

						funcCallback.call(pCallOwner, data);

					});
				}
		},this);
	},
	
	// 设置首次出生位置信息
	req_SetBirthPosition: function(acckey, username,lng, lat, name, funcCallback, pCallOwner) {
		this.checkConnect(function(szState){
			if(szState == "reconnect")
				{
					this.req_SetBirthPosition(acckey, position, name, funcCallback,pCallOwner);
				}
			else if(szState == "connect")
				{
					var pMsg = {};
					pMsg.acckey = acckey;
					pMsg.username = username;
					pMsg.poslng = lng;
					pMsg.poslat = lat;
					pMsg.name = name;


					window.pomelo.request("connector.entryHandler.setBirthPosition", pMsg, function(data) {

						funcCallback.call(pCallOwner, data);
						//callback function

					});
				}
		},this);
	},

	// 设置瞬间移动到某位置
	req_TeleportToPosition: function(acckey, username,lng, lat, name, funcCallback, pCallOwner) {
		this.checkConnect(function(szState){
			if(szState == "reconnect")
				{
					this.req_TeleportToPosition(acckey, username,lng, lat, name, funcCallback,pCallOwner);
				}
			else if(szState == "connect")
				{
					var pMsg = {};
					pMsg.acckey = acckey;
					pMsg.username = username;
					pMsg.poslng = lng;
					pMsg.poslat = lat;
					pMsg.name = name;


					window.pomelo.request("connector.entryHandler.teleportToPosition", pMsg, function(data) {

						funcCallback.call(pCallOwner, data);

					});
				}
		},this);
	},
	
	// 由POI ID 得到对应的数据。。
	req_GetPoiData: function(acckey, username, poiid, poitypetext, funcCallback, pCallOwner) {
		this.checkConnect(function(szState){
			if(szState == "reconnect")
				{
					this.req_GetPoiData(acckey, username,poiid, funcCallback,pCallOwner);
				}
			else if(szState == "connect")
				{
					var pMsg = {};
					pMsg.acckey = acckey;
					pMsg.username = username;
					pMsg.poiid = poiid;
					pMsg.poitypetext = poitypetext;


					window.pomelo.request("connector.entryHandler.getPoiData", pMsg, function(data) {

						funcCallback.call(pCallOwner, data);

					});
				}
		},this);
	},
	
	
	
});