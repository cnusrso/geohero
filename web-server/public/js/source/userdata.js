
define({
  userdata: {
		id:0,
    account: "test1",
    sex: "0",
    acckey:"",
    enterTime:0,
		curpos:null,
    curselectpoidata:null,
  },

  setEnterWorldOk: function(sAccount,sKey){
    this.userdata.account = sAccount;
    this.userdata.acckey = sKey;
    
    var date = new Date();
	  this.userdata.enterTime = date.getTime();
  },

  setCurSelectPoi: function(selPoi){
    this.userdata.curselectpoidata = selPoi;
  },
  getCurSelectPoi: function(){
    return this.userdata.curselectpoidata;
  },


});

// var userdata = {};
// (function() {
//   userdata.name = "test1";
//   userdata.sex = "0";
// })();


// ;(function () {
//   // 私有成员及代码 ...
//   var name="test1";
  
//   var modifyname = function(inName){
//     this.name = inName;
//   };
    
//   var printname = function(){
//     console.log("my name is:", this.name);
//   };
  
  
 
//   return function() {
//     this.name="aaaaa";
//   };
// })();