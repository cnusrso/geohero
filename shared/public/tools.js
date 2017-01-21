// define some function tools...
define({
  checkUserNameHasInvalidText:function(sUserName){
    var pInvalidTextList = [" ",",",".","/","\\","-","_","`","~"];

    var len = pInvalidTextList.length;
    for(var i = 0; i < len; ++ i){
      var s = pInvalidTextList[i];
      var curindex = sUserName.indexOf(s);
      if(curindex != -1){
        return s;
      }
    }
    return "";
  },
  
});