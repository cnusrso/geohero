var commonUtil = module.exports;
var crypto = require('crypto');

commonUtil.crypto = function(text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

// build end password
commonUtil.buildEndPassword = function(sInputUserName,sInputUserPwd){
	var sEndPwd = commonUtil.crypto(sInputUserName+sInputUserPwd);
	sEndPwd = commonUtil.crypto(sInputUserName+sEndPwd);
	sEndPwd = commonUtil.crypto(sInputUserName+sEndPwd);
	sEndPwd = commonUtil.crypto(sInputUserName+sEndPwd);
	sEndPwd = commonUtil.crypto(sInputUserName+sEndPwd);
	sEndPwd = commonUtil.crypto(sInputUserName+sEndPwd);
	
	return sEndPwd;
};

commonUtil.getDateTimeStr = function() {

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

};

commonUtil.getDateTimeNumber = function() {

    var date = new Date();
	return date.getTime();
};