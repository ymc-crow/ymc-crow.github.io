function trigger(data) {
    view.call(this,'trigger');
    var self = this;

    self.hiddenKey = 'lllrrrllrr';
    self.hiddenArr = '';

    self.data = data;
    self.tempData = undefined;

    self.endTime = undefined;
    self.rtTime = undefined;
    self.targetCh = undefined;
    self.randomTriggerTime = 0;

    self.triggerTimer = undefined;

    self.create = function() {
        console.log('trigger page is being called');
        isTriggerCreating = true;
        self.targetCh = self.data["targetChannel"]["locator"];
        self.targetChId = self.data["targetChannel"]["id"];
        if (device.isTargetCh(self.targetCh)) {
            lastTriggerId = self.data['id'];
            isCreatingTrigger = true;
            self.display = $(template);
            $('#spotv #view').append(self.display);
            self.setBgImg(self.display.find('.img-container'),self.data['triggerImagePath'][0],'img/trigger_default.png',function() {
                console.log('default trigger');
                isTriggerDefault = false;
                self.set();
            },function(){
                isTriggerDefault = true;
                self.set('default');
            });
        } else {
            console.log('target Channel invalid');
            self.destroy();
            isTriggerCreating = false;
        }
    };
    self.draw = function() {
        if (!self.data['popupImagePath'] || self.data['popupImagePath'].length < 1 || isTriggerDefault) {
            //버튼 구현 필요 없음 포커스도 없음
            if (isTriggerDefault) {
                self.display.find('.bt-go').css("background-image", "url(img/button_confirm_detailed_s.png)");
            } else {
                self.display.find('.bt-go').css("background-image", "url(img/button_confirm_s.png)");
            }
        }
    };
    self.set = function(defaul) {
        self.draw();
        self.scheduleSet(defaul);
        self.show();
    };
    self.scheduleSet = function(defaul,reset) {
        if (reset) {
            self.randomTriggerTime = 0;
        } else {
            self.randomTriggerTime = Math.floor(Math.random() * ((triggerRandomDisplayTIme * 1000) + 1)) + 0;
        }
        var curTime = new Date().getTime();
        if (defaul) {
            self.rtTime = defaultTriggerRT * 1000;
        } else {
            self.rtTime = self.data["runningTime"];
        }
        var startTime = curTime + self.randomTriggerTime;
        if ((startTime + self.rtTime) < self.data["endDate"]) {
            self.endTime = startTime + self.rtTime;
        } else {
            self.endTime = self.data["endDate"];
        }
        if ((self.endTime - startTime) < (minimumRTtime * 1000)) {
            self.endTime = startTime + (minimumRTtime * 1000);
        }
        console.log('trigger RTtime : ' + (self.endTime - startTime));
    };
    self.show = function() {
        console.log('Trigger Random display time : ' + self.randomTriggerTime);
        self.triggerTimer = setTimeout(function(){
            console.log('trigger Show, ID : ' + self.data['id']);
            //device.setKeyWithOutBack();
            viewMgr.pageLoadComplete(self);
            self.defaultFocus();
            isTriggerCreating = false;
            clearTimeout(self.triggerTimer);
            api.tvaStartLog(appInfo["stbUserId"],appInfo["baseChannelId"],function(d){
                appInfo["lifeCycleId"] = d.lifecycleId;
            });
            api.triggerLog(appInfo["stbUserId"],self.data["id"],appInfo["baseChannelId"]);
         }, self.randomTriggerTime);
    };
    self.check = function() {
        if (self.endTime === undefined) {
            return;
        }
        var curTime = new Date().getTime();
        if (curTime > self.endTime) {
            console.log('trigger auto End');
            clearTimeout(self.triggerTimer);
            viewMgr.currentView = null;
            viewMgr.history = [];
            self.display.remove();
            self.destroy();
            //device.unsetKey();
        }
    };
    self.beforeRevoke = function() {
        self.hiddenArr = '';
        self.scheduleSet(isTriggerDefault,'reset');
        //device.setKeyWithOutBack();
    };
    self.defaultFocus = function() {
        self.nextFocus(self.display.find('.bt-go'));
    };
    self.checkHidden = function(key) {
        if (key === 'left') {
            self.hiddenArr = self.hiddenArr + 'l';
        } else if (key === 'right') {
            self.hiddenArr = self.hiddenArr + 'r';
        }
        if (self.hiddenArr === self.hiddenKey) {
            self.hiddenArr = '';
            viewMgr.forward(new version(self.data));
        }
        if (self.hiddenArr.length >= 10) {
            self.hiddenArr = '';
        }
    };
    self.keydown = function(key) {
        self.checkHidden(key);
        switch (key) {
        case "left":
        case "right":
            if (!self.data['popupImagePath'] || self.data['popupImagePath'].length < 1 || isTriggerDefault) {
                return;
            }
            if (self['focusObj'] && self['focusObj'].hasClass('bt-go')) {
                self.nextFocus(self.display.find('.bt-detail'));
            } else {
                self.nextFocus(self.display.find('.bt-go'));
            }
            break;
        case 'ok':
            if ((self['focusObj'] && self['focusObj'].hasClass('bt-detail')) || isTriggerDefault) {
                if (isTriggerDefault || (self.data['popupImagePath'] && self.data['popupImagePath'].length > 0)) {
                    viewMgr.forward(new detail(self.data));
                } else {
                    self.moveChannel(self.targetChId,self.targetCh,1);
                }
            } else {
                self.moveChannel(self.targetChId,self.targetCh,1);
            }
            break;
        case 'exit':
            break;
        default :
            break;
        }
    };
    var template="";
    template += "<div class='trigger'> <div class='img-container'><\/div><div class='bt-container'> <div class='bt-go'><\/div><div class='bt-detail'><\/div><\/div><\/div>";
};
