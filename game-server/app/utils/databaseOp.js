

module.exports = function() {
  return new Handler();
};

var Handler = function() {
	this.myrequest = require('request');
	this.commonutil = require(process.cwd()+'/app/utils/commonUtil');
	this.dataDef = require(process.cwd()+'/app/utils/dataDefine');


	this.sTable_t_account 		= '57067e02305a2a034b260fa2';
	this.sTable_t_poi			= '570680c6305a2a034b262400';
	
};
var handler = Handler.prototype;


handler.yuntu_GetDataByFilter = function(sTableId,szFilter,funcCallback,pCallOwner){
	var sHttpGetHead = "http://yuntuapi.amap.com/datamanage/data/list?";
	var sSig = this.commonutil.crypto("filter="+szFilter+"&key="+this.dataDef.sGaodeWebServiceKey+"&tableid="+sTableId+this.dataDef.sGaodePrivateKey);
	var sFullURL = sHttpGetHead+"tableid="+sTableId+"&filter="+szFilter+"&key="+this.dataDef.sGaodeWebServiceKey+"&sig="+sSig;
	console.log("yuntu_GetDataByFilter:->",sFullURL);
	this.myrequest(sFullURL, function(error, response, body) {
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
};

handler.yuntu_UpdateNewData = function(sTableId,szData,funcCallback,pCallOwner){
	
	var sHttpPostHead = "http://yuntuapi.amap.com/datamanage/data/update";
	var sSig = this.commonutil.crypto("data="+szData+"&key="+this.dataDef.sGaodeWebServiceKey+"&loctype=1&tableid="+sTableId+this.dataDef.sGaodePrivateKey);
	this.myrequest.post(
		{
			url:sHttpPostHead,
			form:{
				key:this.dataDef.sGaodeWebServiceKey,
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
};

handler.yuntu_AddNewData = function(sTableId,szData,funcCallback,pCallOwner){
	
	var sHttpGetHead = 'http://yuntuapi.amap.com/datamanage/data/create';
	var sSig = this.commonutil.crypto("data="+szData+"&key="+this.dataDef.sGaodeWebServiceKey+"&loctype=1&tableid="+sTableId+this.dataDef.sGaodePrivateKey);
	// do regist
	this.myrequest.post(
		{
			url:sHttpGetHead, 
			form:{
				key:this.dataDef.sGaodeWebServiceKey,
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
};