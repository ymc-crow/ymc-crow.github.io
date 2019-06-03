function version() {
    view.call(this,'version');
    var self = this;

    self.create = function() {
        console.log('version page is being called');
        loadingMgr.on();
        self.display = $(template);
        $('#spotv #view').append(self.display);
        self.setBgImg(self.display.find('.version-box'),'img/ver_popup_bg.png','',function() {
            //device.setKeyWithBack();
            self.display.find('.version-txt').html(binaryVer);
            viewMgr.pageLoadComplete(self);
        });
    };
    self.keydown = function(key) {
        switch (key) {
        case "back":
            viewMgr.backward();
            break;
        case 'ok':
            viewMgr.backward();
            break;
        default :
            break;
        }
    };
    var template="";
    template += "<div class='version'> <div class='version-box'> <div class='version-txt'><\/div><\/div><\/div>";
};
