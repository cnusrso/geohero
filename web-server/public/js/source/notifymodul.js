// use pnotify to notify some info
define({
  pnotify_stack_bar_top: {
      "dir1": "down",
      "dir2": "right",
      "push": "top",
      "spacing1": 0,
      "spacing2": 0
    },

    init: function() {
      PNotify.prototype.options.styling = "jqueryui";


    },

    showNotify: function(sTitle, sContent) {
      new PNotify({
        title: sTitle,
        text: sContent,
        addclass: "stack-bar-top",
        stack: this.pnotify_stack_bar_top,
        remove: true,
        hide: true,
        delay: 2000,
        nonblock: {
          nonblock: true,
          nonblock_opacity: 0.2
        }
      });
    },
  
  
  
  
});
