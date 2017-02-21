

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