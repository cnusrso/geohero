var crc = require('crc');


module.exports.dispatch = function(uid, arrayObj) {

	console.log("dispatch:->",uid,arrayObj);

	var index = Math.abs(crc.crc32(uid)) % arrayObj.length;
	return arrayObj[index];
};