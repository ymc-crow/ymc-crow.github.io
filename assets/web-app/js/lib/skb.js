function tLog(msg){
    if (msg) {
        document.getElementById('testLog').innerHTML += msg + '</br>';
    }
}
const skb = {
        isDevice : window['UTIL']?true:false,
        init : function(cb) {
            tLog('SKB INIT!!!!!!!');
            if (this.isDevice) {
                document.onkeydown = function(e) {
                    tLog(e.keyCode);
                    keyMgr.keydown(e);
                }
            } else {
                document.addEventListener("keydown", function(e){
                    keyMgr.keydown(e);
                });
            }
            if (cb) {
                cb();
            }
        },
        getSAID : function() {
            if (this.isDevice) {
                //return UTIL.expi_getStbId();
                return 'TT000000000';
            } else {
                //return '{11111111-AAAA-0000-BBBB-TTTTTTTTTTTT}';
                return 'TT000000000';
            }
        },
        getIP : function() {
            if (this.isDevice) {
                return UTIL.expi_getNetIpAddr();
            } else {
                return null;
            }
        },
        getNetworkStatus : function() {
            return window.navigator.onLine
        },
        getModelName : function() {
            if (this.isDevice) {
                return UTIL.expi_getStbModel();
            } else {
                return 'BKO-S200';
            }
        },
        destroy : function() {
//            clearInterval(appTimer);
//            
//            if (this.isDevice) {
//                UTIL.expi_CallResponse(0, "close");
//            } else {
//                //window.location.href = 'about:blank';
//            }
        },
        initCh : function() {

        },
        isTargetCh : function(locator) {
            return true;
        },
        setChannel : function(locator,suc,err) {
            //SPOTV(120번) / SPOTV2(128번) / SPOTV+(127번) SPOTVON(118번) 혹은 SPOTVON2(119번)
            if (this.isDevice) {
                tLog('채널이동시작');
                tLog(UTIL.expi_tuneChannel);
                UTIL.expi_tuneChannel(118);
            } else {
                tLog('채널이동' + locator);
            }
            if (suc) {
                suc();
            }
        },
        getChInfo : function() {

        },
        getCurChLocator : function() {
            return baseChannelLocator;
        }
};