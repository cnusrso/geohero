// define some function tools...
var pTools = module.exports;

// if not find invalid text will return "" else return one text.
pTools.checkUserNameHasInvalidText = function(sUserName){
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
};


pTools.getCurrentMaxHp = function(nBaseHp,nBaseRate,nCurLevel){

  return Math.ceil(nBaseHp*nBaseRate*Math.log(nCurLevel);

};

pTools.getRestoreHp_StepTime = function(nBaseRate,nCurLevel){

  return Math.ceil(nCurLevel*Math.log(nBaseRate)*Math.pow(Math.log(nBaseRate),Math.log(nBaseRate)));

};
pTools.getRestoreHp_StepHp = function(nMaxHp,nBaseRate,nCurLevel){

  return Math.ceil(nMaxHp/(nCurLevel*Math.log(nBaseRate)));

};