function detail(data) {
    view.call(this,'detail');
    var self = this;
    self.data = data;

    self.goodImgsUrls = new Array(5);
    self.goodImgs = new Array(5);
    self.imageLoadCounter = 0;

    self.curShowingImg = 0;

    self.displayImgsUrls = [];
    self.displayImgs = [];

    self.create = function() {
        console.log('detail page is being called');
        loadingMgr.on();
        self.display = $(template);
        $('#spotv #view').append(self.display);
        self.targetCh = self.data["targetChannel"]["locator"];
        self.targetChId = self.data["targetChannel"]["id"];
        if (isTriggerDefault) {
            self.defaultImg();
        } else {
            self.imagePreload(self.data["popupImagePath"]);
        }
//        self.setBgImg(self.display,triggerImgPath,'detail_default.png',function() {
//            this.setKeyWithBack();
//            viewMgr.pageLoadComplete(self);
//        });
    };
    self.setDisplayImg = function(){
        self.setIndi();
        var tar = self.display.find('.img-container');
        var img = self.displayImgs[self.curShowingImg];
        tar.html('');
        tar.append(img);
    };
    self.setIndi = function(){
        self.display.find('.indi-unit').removeClass('cur');
        self.display.find('.indi-unit').css('display','none');
        for(var i = 0; i < self.displayImgs.length; i++) {
            var tar = self.display.find('.indi-unit')[i];
            $(tar).css('display','inline-block');
        }
        $(self.display.find('.indi-unit')[self.curShowingImg]).addClass('cur');
    };
    self.complete = function() {
        //device.setKeyWithBack();
        viewMgr.pageLoadComplete(self);
        api.detailLog(appInfo['stbUserId'],lastTriggerId,appInfo['baseChannelId'])
    };
    self.draw = function() {
        if (self.displayImgs.length > 1) {
            self.display.find('.arrow').css('display','block');
        } else {
            self.display.find('.indi-container').css('display','none');
        }
        self.setDisplayImg();
        self.complete();
    };
    self.defaultImg = function() {
        var img = new Image();
        img.onload = function(){
            console.log('detail default iamge Loaded ');
            var tar = self.display.find('.img-container');
            tar.html('');
            tar.append(img);
            self.complete();
        };
        img.src = 'img/detail_default.jpg';
    };
    self.imagePreload = function(imgs){
        if (imgs && imgs.length > 0) {
            for(var i = 0; i < imgs.length; i++) {
                self.imageSet(imgs[i],i);
            }
        } else {
            self.defaultImg();
        } 
    };
    self.imageSet = function(imageUrl,index) {
        var img = new Image();
        function imgError() {
            clearTimeout(imgTimer);
            img.onload = null;
            img.onerror = null;
            self.imageLoadCounting();
        }
        if (imageUrl === undefined || imageUrl === null || imageUrl === '') {
            console.log('imageUrl invalid');
            imgError();
            return;
        }
        var imgTimer = setTimeout(function() {
            console.log('iamge Load TimeOut : ' + imageUrl);
            imgError();
        }, 3000); 
        img.onload = function(){
            console.log('iamge Loaded : ' + imageUrl);
            clearTimeout(imgTimer);
            self.goodImgsUrls[index] = imageUrl;
            //self.goodImgsUrls.splice( index, 0, imageUrl);
            self.goodImgs[index] = this;
            //self.goodImgs.splice( index, 0, this);
            self.imageLoadCounting();
        };
        img.onerror = function(){
            console.log('iamge Load Fail : ' + imageUrl);
            imgError();
        };
        img.src = imageUrl;
    };
    self.imageLoadCounting = function(){
        self.imageLoadCounter++;
        if (self.data["popupImagePath"].length === self.imageLoadCounter) {
            self.imageLoadComplete();
        }
    };
    self.imageLoadComplete = function() {
        for(var i = 0; i < self.goodImgsUrls.length; i++) {
            var val = self.goodImgsUrls[i];
            if (val !== null && val !== undefined && val !== '') {
                self.displayImgsUrls.push(self.goodImgsUrls[i]);
                self.displayImgs.push(self.goodImgs[i]);
            }
        }
        if (self.displayImgs.length > 0) {
            self.draw();
        } else {
            self.defaultImg();
        }
    };
    self.keydown = function(key) {
        tLog('datail key : ' + key);
        switch (key) {
        case "back":
            viewMgr.backward();
            break;
        case "left":
            if (self.displayImgs.length > 0) {
                self.curShowingImg--;
                if (self.curShowingImg < 0) {
                    self.curShowingImg = self.displayImgs.length - 1;
                }
                self.setDisplayImg();
            }
            break;
        case "right":
            if (self.displayImgs.length > 0) {
                self.curShowingImg++;
                if (self.curShowingImg > self.displayImgs.length - 1) {
                    self.curShowingImg = 0;
                }
                self.setDisplayImg();
            }
            break;
        case 'ok':
            if (isTriggerDefault || self.displayImgs.length < 1) {
                viewMgr.backward();
            } else {
                self.moveChannel(self.targetChId,self.targetCh);
            }
            break;
        default :
            break;
        }
    };
    var template="";
    template += "<div class='detail'> <div class='arrow left-arrow'><\/div><div class='arrow right-arrow'><\/div><div class='img-container'><\/div><div class='bt'><\/div><div class='indi-container'> <div class='indi-left'><\/div><div class='indi-middle'> <div class='indi-unit' idx=0><\/div><div class='indi-unit' idx=1><\/div><div class='indi-unit' idx=2><\/div><div class='indi-unit' idx=3><\/div><div class='indi-unit' idx=4><\/div><\/div><div class='indi-right'><\/div><\/div><\/div>";
};
