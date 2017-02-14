

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
	this.app = app;

	var myredis = require("redis");
	this.myrediscl = myredis.createClient();
	this.myrediscl.on("connect", function () {
	    console.log(app.getServerId()+" redis client connect start ");		
	});
	this.myrediscl.on("error", function (err) {
	    console.log(app.getServerId()+" redis client Error " + err);
	});

	this.pRedisKeys = {
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

	this.pRedisListKeys = {
		list_key_all_dirty_poiid:function(){return "all:dirty:poiid";},
		list_key_poiid_dirty:function(poiid){return "poiid:"+poiid.toString()+":poidatadirty";},
	};

	this.pRedisSetKeys = {
		set_key_all_dirty_poiid:function(){return "all:dirty:poiid";},
	};

	// this.myrediscl.sadd("myset","aaaaa");
	// this.myrediscl.sadd("myset","bbbbb");
	// this.myrediscl.sadd("myset","ccccc");
	// this.myrediscl.sadd("myset","ccccc");
	// this.myrediscl.spop("myset",function(err,reply){
	// 	console.log("myset spop",err,reply);
	// });
	// this.myrediscl.smembers("myset",function(err,reply){
	// 	console.log("myset smembers",err,reply);
	// });
	// this.myrediscl.rpush("mylist","listvalue1");
	// this.myrediscl.rpush("mylist","listvalue2");
	// this.myrediscl.rpush("mylist","listvalue3");
	// this.myrediscl.llen("mylist",function(err,reply){
	// 	console.log("llen",err,reply);
	// })
	// this.myrediscl.lrange("mylist",0,-1,function(err,reply){
	// 	console.log("lrange",err,reply);
	// })
	// var self = this;
	// this.myrediscl.lpop("mylist",function(err,reply){
	// 	console.log("lpop",err,reply);
	// })
	
};
var handler = Handler.prototype;


handler.setDataByKey = function(szKey,sData){
	this.myrediscl.set(szKey,sData);
};
handler.getDataByKey = function(szKey,pExtData,funcCallback,pCallOwner) {
	this.myrediscl.get(szKey, function(err, reply) {
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, err, reply, pExtData);
		} else if (funcCallback != null) {
			funcCallback(err, reply, pExtData);
		}
	});
}
handler.delDataByKey = function(szKey){
	this.myrediscl.del(szKey);
}


handler.listRPush = function(szListKey,inValue){
	this.myrediscl.rpush(szListKey,inValue);
};
handler.listLLen = function(szListKey,pExtData,funcCallback,pCallOwner){
	this.myrediscl.llen(szListKey,function(err,reply){
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, err, reply, pExtData);
		} else if (funcCallback != null) {
			funcCallback(err, reply, pExtData);
		}
	})
};
handler.listLPop = function(szListKey,pExtData,funcCallback,pCallOwner){
	this.myrediscl.lpop(szListKey,function(err,reply){
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, err, reply, pExtData);
		} else if (funcCallback != null) {
			funcCallback(err, reply, pExtData);
		}
	})
};

handler.setAdd = function(szSetKey,inValue){
	this.myrediscl.sadd(szSetKey,inValue);
};
handler.setPop = function(szSetKey,pExtData,funcCallback,pCallOwner){
	this.myrediscl.spop(szSetKey,function(err,reply){
		// console.log("myset spop",err,reply);
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, err, reply, pExtData);
		} else if (funcCallback != null) {
			funcCallback(err, reply, pExtData);
		}
	});
};