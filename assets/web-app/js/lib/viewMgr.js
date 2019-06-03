function view(name) {
	var self = this;
	self.init = false;
	self.data = undefined;
	self.display = undefined;
	self['focusObj'] = undefined;

	self.channelMoveTimer = undefined;
	if (name) {
		self.name = name;
	}
	self.setBgImg = function(frame, imgUrl,defaultImgUrl,callback,ercb) {
		console.log(self.name + ' setbgimg start');
        if (imgUrl === null || imgUrl === undefined || imgUrl === '') {
            frame.css("background-image", 'url("' + defaultImgUrl + '")');
            console.log(self.name + ' setbgimg error');
            ercb();
        } else {
            var containerImg = $('<img/>');
            var bgImgTimer = setTimeout(function() {
                containerImg.off();
                ercb();
                clearTimeout(bgImgTimer);
            }, 3000); 
            containerImg.attr('src', imgUrl).load(function() {
                   $(this).remove();
                   frame.css("background-image", 'url("' + imgUrl + '")');
                   console.log(self.name + ' setbgimg success');
                   clearTimeout(bgImgTimer);
                   callback();
                }).error(function(){
                    $(this).remove();
                    frame.css("background-image", 'url("' + defaultImgUrl + '")');
                    console.log(self.name + ' setbgimg error');
                    clearTimeout(bgImgTimer);
                    ercb();
                });
        }
	};
	self.nextFocus = function(obj) {
        if (obj) {
            obj.addClass('focus');
            if (self['focusObj']) {
                self['focusObj'].removeClass('focus');
            }
            self['focusObj'] = obj;
        }
    };
	self.revoke = function() {
	    if (self.beforeRevoke) {
            self.beforeRevoke();
        }
		$('#spotv #view').html(self.display);
	};
	self.destroy = function() {
		for (var key in self) {
		    if (self.hasOwnProperty(key)) {
		        //Now, object[key] is the current value
		        if (self[key]) {
		        	delete self[key];
		        }
		    }
		}
		self = null;
	};
	self.moveChannel = function(id,locator){
	    var locator = locator;
	    var pageNum = undefined;
	    if (self.name === 'trigger') {
	        pageNum = 1;
	    } else {
	        pageNum = 2;
	    }
	    api.channelLog(appInfo['stbUserId'],lastTriggerId,appInfo['baseChannelId'],id,pageNum);
	    self.channelMoveTimer = setTimeout(function(){
            clearTimeout(self.channelMoveTimer);
            device.setChannel(locator,function(){
                api.tvaEndtLog(appInfo["stbUserId"],appInfo["lifeCycleId"]);
            },function(channel,errorState){
                viewMgr.viewEnd();
                api.exceptionLog(appInfo["lifeCycleId"],'','channel move Fail',errorState,'',channel,'','');
            });
         }, channelMoveDelayForLog * 1000);
	};
};
function manager(name) {
	var self = this;
	if (name) {
		self.name = name;
	}
	self.history = [];
	self.histroyClean = function() {
		while (self.history.length > 0) {
			var view = self.history.pop();
			if (view.destroy) {
				view.destroy();
			}
			view = null;
		}
	};
};

const viewMgr = new function() {
	var self = this;
	manager.call(this,'viewMgr');
	self.forward = function(view, deleteNum, noLoading) {
		//뷰 그리기 전 히스토리 삭제 가능
		if (deleteNum) {
			var delView;
			for (var i=0; i<deleteNum; i++) {
				if (self.history.length>0) {
					delView = self.history.pop();
					if (delView && delView.destroy) {
						//delPop.display.remove();
						delView.destroy();
					}
					delView = null;
				}
			}
		}
		view.create();
	};
	self.pageLoadComplete = function(view){
		//페이지 로드가 끝나면  현재 페이지를 보여주고 이전페이지의 뷰를 삭제
		view.display.css('display', 'block');
		if (self.history.length>0) {
			var preview = self.history[self.history.length - 1];
			preview.display.remove();
		}
		if (!view.init) {
			self.currentView = view;
			self.history.push(view);
			view.init = true;
		}
		loadingMgr.off();
	};
	self.backward = function() {
		var current = self.history.pop();
		if (self.history.length>0) {
			var target = self.history[self.history.length - 1];
			target.revoke();
			self.currentView = target;
			current.destroy();
			current = null;
		}
	};
	self.viewEnd = function(){
	    $('#spotv #view').html('');
	    self.histroyClean();
	    self.currentView = null;
	};
};

const popupMgr = new function() {
	var self = this;
	manager.call(this,'popupMgr');
	self.forward = function(view, deleteNum) {
		//popup load전 팝업의 히스토리를 원하는 개수 만큼 지울 수 있음
		if (deleteNum) {
			var delPop;
			for (var i=0; i<deleteNum; i++) {
				if (self.history.length>0) {
					delPop = self.history.pop();
					if (delPop && delPop.destroy) {
						//delPop.display.remove();
						delPop.destroy();
					}
					delPop = null;
				}
			}
		}
		view.create();
	};
	self.popLoadComplete = function(view){
		//페이지 로드가 끝나면  현재 페이지를 보여주고 이전페이지의 뷰를 삭제
		view.display.css('display', 'block');
		if ($('.popup').length > 1) {
			$($('.popup')[0]).remove();
		}
		self.currentView = view;
		if (!view.init) {
			self.history.push(view);
			view.init = true;
		}
		LoadingMgr.off();
	};
	self.backward = function() {
		var target;
		var current = self.history.pop();
		if (self.history.length>0) {
			target = self.history[self.history.length - 1];
			if (target.beforeRevoke) {
				//실제 화면에 붙기 전에 수행하는 것들
				target.beforeRevoke();
			}
			$('#ppp').append(target.display);
			if (target.afterRevoke) {
				//실제 화면에 붙은 후 수행되는 것들
				target.afterRevoke();
			}
			self.currentView = target;
		} else {
			self.currentView = null;
		}
		$($('.popup')[0]).remove();
		if (current && current.destroy) {
			current.destroy();
		} 
		current = null;
		LoadingMgr.off();
	};
	self.popSceneEnd = function() {
		$('.popup').remove();
		if (self.history.length > 0) {
			var current = self.history.pop();
			current.destroy();
			current = null;
			self.histroyClean();
		}
		self.currentView = null;
	};
};
const loadingMgr = new function() {
    var self= this;
    self.isOn = false;
    self.imgs = '';
    self.imgIdx = 0;
    self.interval = null;
    self.setImg = function() {
        $('#loading').html(self.imgAry[self.imgIdx]);
        self.imgIdx++;
        if (self.imgIdx >= self.imgAry.length ) {
            self.imgIdx = 0;
        }
    };
    self.on = function() {
        if (!self.isOn) {
            self.isOn = true;
            self.imgIdx = 0;
            self.setImg();
            $('#loading').css('display','block');
            self.interval = setInterval(function(){
                self.setImg();
            }, 200);
        }
    };

    self.off = function() {
        if (self.isOn) {
            self.isOn = false;
            $('#loading').css('display','none');
            clearInterval(self.interval);
            self.interval = null;
        }
    };
    self.imgAry = [$('<img class="loading-img" src="img/loading/loading_1.png">'),
        $('<img class="loading-img" src="img/loading/loading_2.png">'),
        $('<img class="loading-img" src="img/loading/loading_3.png">'),
        $('<img class="loading-img" src="img/loading/loading_4.png">'),
        $('<img class="loading-img" src="img/loading/loading_5.png">'),
        $('<img class="loading-img" src="img/loading/loading_6.png">'),
        $('<img class="loading-img" src="img/loading/loading_7.png">'),
        $('<img class="loading-img" src="img/loading/loading_8.png">')];
};