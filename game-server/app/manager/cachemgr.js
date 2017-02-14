

module.exports = function(app) {
  return new CacheMgr(app);
};

var CacheMgr = function(app) {
	this.app = app;

	this.commonutil = app.get('_commonutil');
	this.rediscl = app.get('_rediscl');
	this.tableutil = app.get('_tableUtil');
	this.databaseutil = app.get('_databaseUtil');
};
var cachemgr = CacheMgr.prototype;

cachemgr.mycache_SetPoiData = function(szPoiId,sData){
	var pkey = this.rediscl.pRedisKeys.key_poiid_data(szPoiId);
	this.rediscl.setDataByKey(pkey,sData);

	var pKeySet = this.rediscl.pRedisSetKeys.set_key_all_dirty_poiid();
	this.rediscl.setAdd(pKeySet,szPoiId);
}
cachemgr.mycache_GetPoiData = function(szPoiId, funcCallback, pCallOwner) {
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