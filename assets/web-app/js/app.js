var device = {};
var appInfo = {
        "lifeCycleId" : false,
        "stbUserId" : null,
        "baseChannelId" : null
};

var scheduleData = undefined;
var scheduleUpdateTerm = 60;
var scheduleUpdateTime = new Date().getTime() + (60 * 60 * 1000);
var defaultTriggerRT = 30;
var triggerRandomDisplayTIme = 30;

var lastTriggerId = undefined;
var isTriggerDefault = false;
var isTriggerCreating = false;

var appTimer = undefined;


function startTimer() {
    var appTimer = setInterval(function() {
        var curTime = new Date().getTime();
        if (scheduleUpdateTime < curTime) {
            modifyUpdateTime();
            setSchedule();
        }
        if (viewMgr.history.length === 1) {
            //트리거 떠있는 상태
            var tr = viewMgr.currentView;
            tr.check();
        }
        if (viewMgr.history.length === 0 && !isTriggerCreating) {
            //화면에 아무것도 없는 상태
            var curValidSchedule = getCurSchedule();
            var scData = null;
            if (curValidSchedule) {
                scData = $.extend({},curValidSchedule);
            }
            // 시간대에 맞는 스케쥴이 있고 그 스케쥴에 대해서는 최초 1번만 노출한다
            if (scData && scData['callCounter'] < 2 && device.getNetworkStatus()) {
                //isTriggerCreating은 나중 트리거가 먼저뜨는것을 방지하기 위함
                viewMgr.forward(new trigger(scData));
            }
        }
        //상세가 떠있는 경우엔 타이머에서 뷰 관련 액션은 없다
     }, 500);
}
function getCurSchedule() {
    if (!scheduleData || scheduleData.length < 1) {
        return null;
    }
    var curTime = new Date().getTime();
    for (var i=0; i<scheduleData.length; i++) {
        if (scheduleData[i].startDate < curTime && scheduleData[i].endDate > curTime 
                && lastTriggerId !== scheduleData[i]['id']) {
            if (scheduleData[i]['callCounter'] === undefined) {
                scheduleData[i]['callCounter'] = 1;
            } else {
                scheduleData[i]['callCounter']++;
            }
            return scheduleData[i];
            break;
        }
    }
    return null;
}
function modifyUpdateTime() {
    scheduleUpdateTime = new Date().getTime() + (scheduleUpdateTerm * 60 * 1000);
}
function setSchedule() {
    api.schedule(appInfo["stbUserId"],appInfo["baseChannelId"],function(data) {
        scheduleData = data.schedule;
    },function(){
        if (lastTriggerId){
            //업데이트시 실패면 데이터  무시
        } else {
            //처음 스케쥴 수신시
            device.destroy();
        }
    });
}
function start() {
    api.base(function(data){
        var p = data.property;
        function findTerm(ary) {
            //return ary.name === "REQUEST_SCHEDULE_TERM";
            for (var i=0; i<ary.length; i++) {
                if (ary[i].name === "REQUEST_SCHEDULE_TERM") {
                    return ary[i].value;
                }
            }
        }
        function findDefaultRT(ary) {
            //return ary.name === "DEFAULT_TRIGGER_RT";
            for (var i=0; i<ary.length; i++) {
                if (ary[i].name === "DEFAULT_TRIGGER_RT") {
                    return ary[i].value;
                }
            }
        }
        function findTriggerRandomTime(ary) {
            //return ary.name === "TRIGGER_RANDOM_DISPLAY_TIME";
            for (var i=0; i<ary.length; i++) {
                if (ary[i].name === "TRIGGER_RANDOM_DISPLAY_TIME") {
                    return ary[i].value;
                }
            }
        }
        appInfo["stbUserId"] = data["stbUserId"];
        appInfo["baseChannelId"] = data["baseChannelId"];
        if (p && p.length > 0) {
            scheduleUpdateTerm = parseInt(findTerm(p));
            defaultTriggerRT = parseInt(findDefaultRT(p));
            triggerRandomDisplayTIme = parseInt(findTriggerRandomTime(p));
        }
        setSchedule();
        modifyUpdateTime();
        startTimer();
    },function(){
        device.destroy();
    });
}
function init(){
    device = skb;
    device.init(start);
}
if (document.readyState === 'complete') {
    init();
} else {
    $(document).ready(function() {
        init();
    });
}
