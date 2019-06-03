var api = new function() {
    var self = this;
    self.tvaStartFlag = false;
    self.triggerShowFlag = false;
    self.timeOut = 5 * 1000;
    var Ajax = function(arg) {
        ajaxObj = $.ajax({
                        type : arg.type? arg.type : "POST",
                        url : arg.url,
                        headers : {},
                        dataType : "json",
                        data : arg.data,
                        crossDomain : true,
                        xhrField : {
                            withCredentials : true
                        },
                        contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
                        timeout : self.timeOut,
                        success : function(msg, status, xhr) {
                            arg.success(msg, status, xhr);
                        },
                        error : function(xhr, status, thrown) {
                            arg.error(xhr, status, thrown);
                        }
                    });
        return ajaxObj;
    };
    self.base = function(suc,err) {
        var request = {
                "url" : serverApi + "/formation/base",
                "type" : "POST",
                "data" : {
                    'stbId': device.getSAID(),
                    'stbModel' : device.getModelName(),
                    'platformType' : 'W',
                    'channelLocator' : device.getCurChLocator()
                },
                "success" : function(data) {
                    console.log('api log : base success');
                    suc(data);
                },
                "error" : function(xhr, status, thrown) {
                    console.log('api log : base error');
                    err(xhr, status, thrown);
                }
        };
        var ajaxObj = Ajax(request);
        return ajaxObj;
    };
    self.schedule = function(stbUserId,baseChannelId,suc,err) {
        var request = {
                "url" : serverApi + "/formation/schedule",
                "type" : "POST",
                "data" : {
                    'stbId': device.getSAID(),
                    'stbUserId' : stbUserId,
                    'platformType' : 'W',
                    'baseChannelId' : baseChannelId
                },
                "success" : function(data) {
                    console.log('api log : schedule success');
                    suc(data);
                },
                "error" : function(xhr, status, thrown) {
                    console.log('api log : schedule error');
                    err(xhr, status, thrown);
                }
        };
        var ajaxObj = Ajax(request);
        return ajaxObj;
    };
    self.tvaStartLog = function(stbUserId,baseChannelId,suc) {
        if (self.tvaStartFlag) {
            return;
        }
        self.tvaStartFlag = true;
        var request = {
                "url" : serverApi + "/log/lifecycle/start",
                "type" : "POST",
                "data" : {
                    'stbId': device.getSAID(),
                    'stbUserId' : stbUserId,
                    'platformType' : 'W',
                    'baseChannelId' : baseChannelId
                },
                "success" : function(data) {
                    console.log('api log : tvaStart success');
                    suc(data);
                },
                "error" : function(xhr, status, thrown) {
                    console.log('api log : tvaStart status -> '  + xhr.status);
                }
        };
        var ajaxObj = Ajax(request);
        return ajaxObj;
    };
    self.tvaEndtLog = function(stbUserId,lifecycleId) {
        if (lifecycleId) {
            if (self.tvaEndFlag) {
                return;
            }
            self.tvaEndFlag = true;
            var request = {
                    "url" : serverApi + "/log/lifecycle/close",
                    "type" : "POST",
                    "data" : {
                        'stbId': device.getSAID(),
                        'stbUserId' : stbUserId,
                        'lifecycleId' : lifecycleId
                    },
                    "success" : function(data) {
                        console.log('api log : tvaEnd success');
                    },
                    "error" : function(xhr, status, thrown) {
                        console.log('api log : tvaEnd status -> ' + xhr.status);
                    }
            };
            var ajaxObj = Ajax(request);
            return ajaxObj;
        }
    };
    self.triggerLog = function(stbUserId,scheduleId,baseChannelId) {
        if (self.triggerShowFlag) {
            return;
        }
        self.triggerShowFlag = true;
        var request = {
                "url" : serverApi + "/log/trigger/display",
                "type" : "POST",
                "data" : {
                    'stbId': device.getSAID(),
                    'stbUserId' : stbUserId,
                    'platformType' : 'W',
                    'scheduleId' : scheduleId,
                    'baseChannelId' : baseChannelId
                },
                "success" : function(data) {
                    console.log('api log : triggerLog success');
                },
                "error" : function(xhr, status, thrown) {
                    console.log('api log : triggerLog status -> ' + xhr.status);
                }
        };
        var ajaxObj = Ajax(request);
        return ajaxObj;
    };
    self.detailLog = function(stbUserId,scheduleId,baseChannelId) {
        var request = {
                "url" : serverApi + "/log/detail/entry",
                "type" : "POST",
                "data" : {
                    'stbId': device.getSAID(),
                    'stbUserId' : stbUserId,
                    'platformType' : 'W',
                    'scheduleId' : scheduleId,
                    'baseChannelId' : baseChannelId
                },
                "success" : function(data) {
                    console.log('api log : detailLog success');
                },
                "error" : function(xhr, status, thrown) {
                    console.log('api log : detailLog status -> ' + xhr.status);
                }
        };
        var ajaxObj = Ajax(request);
        return ajaxObj;
    };
    self.channelLog = function(stbUserId,scheduleId,baseChannelId,targetChannelId,entryPoint) {
        var request = {
                "url" : serverApi + "/log/channel/entry",
                "type" : "POST",
                "data" : {
                    'stbId': device.getSAID(),
                    'stbUserId' : stbUserId,
                    'platformType' : 'W',
                    'scheduleId' : scheduleId,
                    'baseChannelId' : baseChannelId,
                    'targetChannelId' : targetChannelId,
                    'entryPoint' : entryPoint
                },
                "success" : function(data) {
                    console.log('api log : channelLog success');
                },
                "error" : function(xhr, status, thrown) {
                    console.log('api log : channelLog status -> ' + xhr.status);
                }
        };
        var ajaxObj = Ajax(request);
        return ajaxObj;
    };
    self.exceptionLog = function(lifecycleId,situation,exceptionName,exceptionDesc,interlockUrl,interlockParam,interlockStatus,interlockMsg) {
        var request = {
                "url" : serverApi + "/exceptions/collect",
                "type" : "POST",
                "data" : {
                    'stbId': device.getSAID(),
                    'stbModel' : device.getModelName(),
                    'platformType' : 'W',
                    'lifecycleId' : lifecycleId,
                    'situation' : situation,
                    'exceptionName' : exceptionName,
                    'exceptionDesc' : exceptionDesc,
                    'interlockUrl' : interlockUrl,
                    'interlockParam' : interlockParam,
                    'interlockStatus' : interlockStatus,
                    'interlockMsg' : interlockMsg
                },
                "success" : function(data) {
                    console.log('api log : exceptionLog success');
                },
                "error" : function(xhr, status, thrown) {
                    console.log('api log : exceptionLog status -> ' + xhr.status);
                }
        };
        var ajaxObj = Ajax(request);
        return ajaxObj;
    };
};
