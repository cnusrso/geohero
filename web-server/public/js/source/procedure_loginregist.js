// do loing and regist ...
define(['jquery','jqueryui','pnotify','md5','blockui'],{

  
  
  

  doLogin: function() {

  },

  doRegist: function() {

  },
  
  init: function() {

   var singleton = this;
    
    

    // 初始化进入窗口
    _gdata.model_jq("#dialog-SignIn").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      draggable: true,
      show: {
        effect: "blind",
        duration: 200
      },
      title: "Welcome back,hero!",
      buttons: [{
        text: "SignIn",
        title: "Happy To Enjoy All World!",
        icons: {
          primary: "ui-icon-arrowthick-1-e"
        },
        click: function() {
          var sUserInputAccount = _gdata.model_jq("#signin_account").val();
          if (sUserInputAccount.length <= 0) {
            _gdata.model_notify.showNotify('Info', "Please Input Your Account!");

            return;
          }
          var sUserInputpwd = _gdata.model_jq("#signin_password").val();
          if (sUserInputpwd.length <= 0) {
            _gdata.model_notify.showNotify('Info', "Please Input Your Password!");

            return;
          }
          var sInvalidText = _gdata.model_util.CheckUserNameHasInvalidText(sUserInputAccount);
          if (sInvalidText.length > 0) {
            _gdata.model_notify.showNotify("Info", "Account Can't Contain Invalid String: \"" + sInvalidText + "\"");
            return;
          }


          _gdata.model_util.BlockMsgShow("In Sigin...");
          
          _gdata.model_netmgr.req_check_SignIn(sUserInputAccount,sUserInputpwd,"web",singleton.onSignInResult,singleton);
        }
      }, {
        text: "SignUp",
        title: "No Account? Now Get It!",
        icons: {
          primary: "ui-icon-arrowreturnthick-1-w"
        },
        click: function() {
          singleton.closeLoginDlg();
          singleton.showRegistDlg();
        }
      }]
    });

    // 初始化注册帐号窗口
    _gdata.model_jq("#dialog-SignUp").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      width: 350,
      draggable: true,
      show: {
        effect: "blind",
        duration: 800
      },
      closeOnEscape: false,
      dialogClass: "noclose",
      title: "New to geographer hero?",
      buttons: [{
        text: "SignUp",
        icons: {
          primary: "ui-icon-arrowthick-1-e"
        },
        click: function() {

          var sUserInputAccount = _gdata.model_jq("#register_account").val();
          if (sUserInputAccount.length <= 0) {
            _gdata.model_notify.showNotify('Info', "Please Input Your Account!");

            return;
          }
          var sUserInputpwd = _gdata.model_jq("#register_password").val();
          if (sUserInputpwd.length <= 0) {
            _gdata.model_notify.showNotify('Info', "Please Input Your Password!");
            return;
          }
          var sUserInputpwd_ = _gdata.model_jq("#register_againpassword").val();
          if (sUserInputpwd_.length <= 0) {
            _gdata.model_notify.showNotify('Info', "Please Input Your Password Again!");
            return;
          }
          if (sUserInputpwd_ != sUserInputpwd) {
            _gdata.model_notify.showNotify('Info', "Your Password Is Not Equal!");
            return;
          }

          var sInvalidText = _gdata.model_util.CheckUserNameHasInvalidText(sUserInputAccount);
          if (sInvalidText.length > 0) {
            _gdata.model_notify.showNotify("Info", "Account Can't Contain Invalid String: \"" + sInvalidText + "\"");
            return;
          }

          _gdata.model_util.BlockMsgShow("In SignUp...");
          
          _gdata.model_netmgr.req_check_Register(sUserInputAccount,sUserInputpwd,"web",singleton.onRegisterResult,singleton);
        }
      }, {
        text: "SignIn",
        title: "Has A Account? Immediately Sign In!",
        icons: {
          primary: "ui-icon-arrowreturnthick-1-w"
        },
        click: function() {
          singleton.closeRegistDlg();
          singleton.showLoginDlg();
        }
      }]
    });
  },

  onSignInResult: function(pData) {
    console.info(pData.msg);
    _gdata.model_util.BlockMsgHide();
    
    if (pData.code == 200) {
      _gdata.model_jq("#btn-Account").text(pData.account);
      _gdata.model_notify.showNotify("SignIn Ok", "\"" + pData.account + "\" Enter World!!!");
      _gdata.model_userdata.setEnterWorldOk(pData.account,pData.msg);
      this.closeLoginDlg();
      this.toNextProcedure();

    } else {
      _gdata.model_notify.showNotify("SignIn Failed", "\"" + pData.account + "\" SignIn Failed(" + pData.code + ") " + pData.msg);
    }
  },
  
  onRegisterResult: function(pData) {
    console.info(pData.msg);
    _gdata.model_util.BlockMsgHide();
    
    if (pData.code == 200) {
      _gdata.model_jq("#btn-Account").text(pData.account);
      _gdata.model_notify.showNotify("SignUp Ok", "\"" + pData.account + "\" Enter World!!!");
      _gdata.model_userdata.setEnterWorldOk(pData.account,pData.msg);
      this.closeRegistDlg();
      this.toNextProcedure();

    } else {
      _gdata.model_notify.showNotify("SignUp Failed", "\"" + pData.account + "\" SignUp Failed(" + pData.code + ") " + pData.msg);
    }
  },
  
  closeLoginDlg: function() {
    _gdata.model_jq("#dialog-SignIn").dialog("close");
  },
  showLoginDlg: function() {    

    _gdata.model_jq("#dialog-SignIn").dialog("option", "position", {
        my: "center",
        at: "center",
        of: window
      });
      _gdata.model_jq("#dialog-SignIn").dialog("open");
    
    
  },
  closeRegistDlg: function(){
    _gdata.model_jq("#dialog-SignUp").dialog("close");
  },
  showRegistDlg: function() {
    
    _gdata.model_jq("#dialog-SignUp").dialog("option", "position", {
      my: "center",
      at: "center",
      of: window
    });
    _gdata.model_jq("#dialog-SignUp").dialog("open");
  },

  enter: function(){
    
    var singleton = this;
    
    _gdata.model_jq( "#btn-Account" ).css("display","inline");
    _gdata.model_jq("#btn-Account").text("未登录");
    _gdata.model_jq( "#btn-Move" ).css("display","inline");
    
    _gdata.model_jq( "#btn-Move" ).click(function(event){
      event.preventDefault();
      _gdata.model_map.StepMove(100,100);
    });
    
    _gdata.model_jq("#btn-Account").click(function(event) {
      event.preventDefault();

      singleton.showLoginDlg();
    });

  },
  
  toNextProcedure: function() {
    
    _gdata.model_jq( "#btn-Move" ).off("click");
    _gdata.model_jq( "#btn-Account" ).off("click");

    
    _gdata.procedure_main.enter();
  },
});