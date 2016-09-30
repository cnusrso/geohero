// define some function tools...
define({
  CheckUserNameHasInvalidText:function(sUserName)
  {
    var pInvalidTextList = [" ",",",".","/","\\","-","_","`","~"];

    var len = pInvalidTextList.length;
    for(var i = 0; i < len; ++ i)
    {
      var s = pInvalidTextList[i];
      var curindex = sUserName.indexOf(s);
      if(curindex != -1)
      {
        return s;
      }
    }
    return "";
  },
  
  BlockMsgShow: function(sContent) {
    _gdata.model_jq('body').block({
      message: '<h3>'+sContent+'</h3>',
      css: {
        border: '3px solid #a00'
      }
    });
  },
  
  BlockMsgHide:function(){
    _gdata.model_jq('body').unblock();
  },
  
});
