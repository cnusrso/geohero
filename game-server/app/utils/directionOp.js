
// get paths data by api
module.exports = function() {
  return new Handler();
};

var Handler = function() {
	this.myrequest = require('request');
	this.commonutil = require(process.cwd()+'/app/utils/commonUtil');

	this.sGaodeWebServiceKey = '957606db3c3518da4a5dda76d1641008';
	this.sYunTuPrivateKey = 'b6e5a1d7de8220063267663c21e6e171';
	
};
var handler = Handler.prototype;


handler.gaodeweb_GetDistanceData = function(pSourcePoints,pTargetPoint,funcCallback,pCallOwner){
	var sHttpGetHead = "http://restapi.amap.com/v3/distance?";
	var sSig = this.commonutil.crypto("destination="+pTargetPoint+"&key="+this.sGaodeWebServiceKey+"&origins="+pSourcePoints+this.sYunTuPrivateKey);
	var sFullURL = sHttpGetHead+"origins="+pSourcePoints+"&destination="+pTargetPoint+"&key="+this.sGaodeWebServiceKey+"&sig="+sSig;
	this.myrequest(sFullURL, function(error, response, body) {
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

handler.gaodeweb_GetDrivingData = function(pSourcePosition,pTargetPosition,pSourcePoi,pTargetPoi,funcCallback,pCallOwner,pCustomData){
	var sHttpGetHead = "http://restapi.amap.com/v3/direction/driving?";
	var sSig = this.commonutil.crypto("destination="+pTargetPosition+"&destinationid="+pTargetPoi+"&key="+this.sGaodeWebServiceKey+"&origin="+pSourcePosition+"&originid="+pSourcePoi+this.sYunTuPrivateKey);
	var sFullURL = sHttpGetHead+"origin="+pSourcePosition+"&originid="+pSourcePoi+"&destination="+pTargetPosition+"&destinationid="+pTargetPoi+"&key="+this.sGaodeWebServiceKey+"&sig="+sSig;
	console.log("gaodeweb_GetDrivingData:->",sFullURL);
	this.myrequest(sFullURL, function(error, response, body) {		
		var nResult = 0;
		if (!error && response.statusCode == 200) {
				nResult = 0;
		} else {
			console.log("gaodeweb_GetDrivingData failed:->",error, response, body);
			nResult = 1;
		}
// 		console.log("gaodeweb_GetDrivingData body:->",body);
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, nResult, body, pCustomData);
		} else if (funcCallback != null) {
			funcCallback(nResult, body, pCustomData);
		}
	});
}

handler.gaodeweb_GetWalkingData = function(pSourcePosition,pTargetPosition,funcCallback,pCallOwner,pCustomData){
	var sHttpGetHead = "http://restapi.amap.com/v3/direction/walking?";
	var sSig = this.commonutil.crypto("destination="+pTargetPosition+"&key="+this.sGaodeWebServiceKey+"&origin="+pSourcePosition+this.sYunTuPrivateKey);
	var sFullURL = sHttpGetHead+"origin="+pSourcePosition+"&destination="+pTargetPosition+"&key="+this.sGaodeWebServiceKey+"&sig="+sSig;
	console.log("gaodeweb_GetWalkingData:->",sFullURL);
	this.myrequest(sFullURL, function(error, response, body) {		
		var nResult = 0;
		if (!error && response.statusCode == 200) {
				nResult = 0;
		} else {
			console.log("gaodeweb_GetWalkingData failed:->",error, response, body);
			nResult = 1;
		}
		if (pCallOwner != null && funcCallback != null) {
			funcCallback.call(pCallOwner, nResult, body, pCustomData);
		} else if (funcCallback != null) {
			funcCallback(nResult, body, pCustomData);
		}
	});
}