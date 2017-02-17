

module.exports = function(app) {
  return new CacheMgr(app);
};

var CacheMgr = function(app) {
	this.app = app;

	this.commonutil = app.get('_commonutil');
	this.rediscl = app.get('_rediscl');
	this.tableutil = app.get('_tableUtil');
	this.databaseutil = app.get('_databaseUtil');

	this.myScheduler = require("pomelo-scheduler");

	this.myScheduler.scheduleJob({
		start:Date.now(), 
		period:3000
		}, 
		this.loopfunc_DoDirtyData, 
		{owner: this}
	);


	this.pCacheKeys = {
		set_all_dirty_poi:function(){return "all:dirty:poi";},
		set_all_dirty_account:function(){return "all:dirty:account";},
	};


};
var cachemgr = CacheMgr.prototype;


cachemgr.loopfunc_DoDirtyData = function(data){
	
	var self = data.owner;

	self.UserData_UpdateOneToDB(self);
	self.PoiData_UpdateOneToDB(self);
};

cachemgr.UserData_SetByName = function(sName,sData,nDirty){
	var sKey = this.rediscl.pRedisKeys.key_username_data(sName);
	this.rediscl.setDataByKey(sKey,sData);

	if(nDirty != null){
		var pKeySet = this.pCacheKeys.set_all_dirty_account();
		this.rediscl.setAdd(pKeySet,sName);
	}
};
cachemgr.UserData_SetById = function(sId,sData){
	var sKey = this.rediscl.pRedisKeys.key_userid_data(sId);
	this.rediscl.setDataByKey(sKey,sData);
};
cachemgr.UserData_GetByName = function(szUserName, pInExtData, funcCallback, pCallOwner) {
	var self = this;
	var sKey = self.rediscl.pRedisKeys.key_username_data(szUserName);
	self.rediscl.getDataByKey(sKey,pInExtData,function(sErr,sData,outExtData){
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
						self.UserData_SetByName(pResult.datas[0].account,sBody);
						self.UserData_SetById(pResult.datas[0]._id,sBody);
					} else {
						szResult = "failed";
					}
				} else {
					szResult = "system error";
				}
				if (pCallOwner != null && funcCallback != null) {
					funcCallback.call(pCallOwner, szResult, pResult,outExtData);
				} else if (funcCallback != null) {
					funcCallback(szResult, pResult,outExtData);
				}
			});
		}	else {
			// user in redis ...
			var pResult = JSON.parse(sData);
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, "success", pResult,outExtData);
			} else if (funcCallback != null) {
				funcCallback("success", pResult,outExtData);
			}
		}
	});
};
cachemgr.UserData_GetById = function(szUserId, pInExtData, funcCallback, pCallOwner) {
	var self = this;
	var sKey = self.rediscl.pRedisKeys.key_userid_data(szUserId);
	self.rediscl.getDataByKey(sKey,pInExtData,function(sErr,sData,outExtData){
		if(sErr != null || sData == null){
			// user not in redis,get it from db
			var sFilter = "_id:"+szUserId;
			self.databaseutil.yuntu_GetDataByFilter(self.databaseutil.sTable_t_account,sFilter,function(nResult,sBody){
				var szResult = "";
				var pResult = {};
				if(nResult == 1){
					pResult = JSON.parse(sBody);
					if (pResult.count == 1) {
						// only one account is ok
						szResult = "success";
						// cache this user's value.
						self.UserData_SetByName(pResult.datas[0].account,sBody);
						self.UserData_SetById(pResult.datas[0]._id,sBody);
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
};
cachemgr.UserData_UpdateOneToDB = function(self){
	var pKeyAllDirty = self.pCacheKeys.set_all_dirty_account();
	self.rediscl.setPop(pKeyAllDirty,1,function(err,reply,pExtData){
		if(err != null){
			console.log("rediscl.setPop err",err,"key:",pKeyAllDirty);
			return;
		}
		if(reply == null){
			// console.log("cache no dirty data->");
			return;
		}
		var pOneDirtyAccount = reply;
		console.log("begin cache one user data to db->",pOneDirtyAccount);
		self.UserData_GetByName(pOneDirtyAccount,1,function(szResult,pResult,extData){
			if(szResult != "success"){
				return;
			}
			// all data,need store to db
			var pUpdateData = {
				_id:pResult.datas[0]._id,
				loginkey:pResult.datas[0].loginkey,
				zoom:pResult.datas[0].zoom,
				account:pResult.datas[0].account,
				password:pResult.datas[0].password,
				extdata:pResult.datas[0].extdata,
				money:pResult.datas[0].money,
				nickname:pResult.datas[0].nickname,
			};
			var pUpdateDataJson = JSON.stringify(pUpdateData);
			self.databaseutil.yuntu_UpdateNewData(self.databaseutil.sTable_t_account,pUpdateDataJson,function(nResult,pResultBody){
				if (nResult != 1){
					console.log("update user data err",nResult)
					return;
				}
				var pResult = JSON.parse(pResultBody);
				if (pResult.status != 1) {
					console.log("update user data err status",pResult.status)
					return;
				}
				console.log("success cache one user data to db->",pOneDirtyPoiId);
			});

		});
		
	});
};

cachemgr.PoiData_Set = function(szPoiId,sData,nDirty){
	var pkey = this.rediscl.pRedisKeys.key_poiid_data(szPoiId);
	this.rediscl.setDataByKey(pkey,sData);

	if(nDirty != null){
		var pKeySet = this.pCacheKeys.set_all_dirty_poi();
		this.rediscl.setAdd(pKeySet,szPoiId);
	}
};
cachemgr.PoiData_Get = function(szPoiId, pInExtData, funcCallback, pCallOwner){
	var self = this;
	var pkey = self.rediscl.pRedisKeys.key_poiid_data(szPoiId);
	self.rediscl.getDataByKey(pkey,pInExtData,function(sErr,sData,outExtData){
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
						self.PoiData_Set(szPoiId,sBody);
					} else {
						szResult = "failed";
					}
				} else {
					szResult = "system error";
				}
				if (pCallOwner != null && funcCallback != null) {
					funcCallback.call(pCallOwner, szResult, pResult,outExtData);
				} else if (funcCallback != null) {
					funcCallback(szResult, pResult,outExtData);
				}
			});	
		} else {
			// poi data in redis
			var pResult = JSON.parse(sData);
			if (pCallOwner != null && funcCallback != null) {
				funcCallback.call(pCallOwner, "success", pResult, outExtData);
			} else if (funcCallback != null) {
				funcCallback("success", pResult, outExtData);
			}
		}
	});
};
cachemgr.PoiData_UpdateOneToDB = function(self){
	var pKeyAllDirtyPoi = self.pCacheKeys.set_all_dirty_poi();
	self.rediscl.setPop(pKeyAllDirtyPoi,1,function(err,reply,pExtData){
		if(err != null){
			console.log("rediscl.setPop err",err,"key:",pKeyAllDirtyPoi);
			return;
		}
		if(reply == null){
			// console.log("cache no dirty data->");
			return;
		}
		var pOneDirtyPoiId = reply;
		console.log("begin cache poi one data to db->",pOneDirtyPoiId);
		self.PoiData_Get(pOneDirtyPoiId,1,function(szResult,pResult,extData){
			if(szResult != "success"){
				return;
			}
			// all data,need store to db
			var pUpdateData = {
				_id:pResult.datas[0]._id,
				ownerid:pResult.datas[0].ownerid,
				extdata:pResult.datas[0].extdata,
				occupytime:pResult.datas[0].occupytime,
				battleovertime:pResult.datas[0].battleovertime,
				monsterid:pResult.datas[0].monsterid,
				monsterlevel:pResult.datas[0].monsterlevel,
				monsterhp:pResult.datas[0].monsterhp,
				battlestatus:pResult.datas[0].battlestatus,
			};
			var pUpdateDataJson = JSON.stringify(pUpdateData);
			self.databaseutil.yuntu_UpdateNewData(self.databaseutil.sTable_t_poi,pUpdateDataJson,function(nResult,pResultBody){
				if (nResult != 1){
					console.log("update poi data err",nResult)
					return;
				}
				var pResult = JSON.parse(pResultBody);
				if (pResult.status != 1) {
					console.log("update poi data err status",pResult.status)
					return;
				}
				console.log("success cache one poi data to db->",pOneDirtyPoiId);
			});

		});
		
	});
};
cachemgr.PoiData_AllToDB = function(self){
	var pKeyAllDirtyPoi = self.pCacheKeys.set_all_dirty_poi();
	var bHasData = true;
	// todo
};


cachemgr.UserPois_Init = function(nUserId){
	var self = this;
	var sFilter = "ownerid:"+nUserId;
	self.databaseutil.yuntu_GetDataByFilter(self.databaseutil.sTable_t_poi,sFilter,function(nResult,sBody){
		console.log("init user's pois->",nResult,sBody);
		if(nResult == 1){
			self.UserPois_Set(nUserId,sBody);
		} else {
			console.log("init user's pois error->",sBody);
		}
	});
};
cachemgr.UserPois_Set = function(nUserId,sData){
	var sKey = this.rediscl.pRedisKeys.key_userid_pois(nUserId);
	this.rediscl.setDataByKey(sKey,sData);
};
cachemgr.UserPois_Get = function(nUserId, pInExtData, funcCallback, pCallOwner) {
	var self = this;
	var sKey = self.rediscl.pRedisKeys.key_userid_pois(nUserId);
	self.rediscl.getDataByKey(sKey,pInExtData,function(sErr,sData,outExtData){
		var sResult = "";
		var pResult = {};
		if(sErr != null || sData == null){
			console.log("user's pois not in cache->",sErr,sData);
			sResult = "notcache";
		} else {
			// data in redis
			pResult = JSON.parse(sData);
			sResult = "success";
		}

		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, sResult, pResult, outExtData);
		} else if (funcCallback != null) {
			funcCallback(sResult, pResult, outExtData);
		}

	});
};

