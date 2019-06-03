const keyMgr = {
        isOn : true,
        event : {
            'timeStamp' : 0,
            'source' : 1
        },
        delayKeydown : 250,
        on : function() {
            this.isOn = true;
        },
        off : function() {
            this.isOn = false;
        },
        stopEvent : function(e) {
            if (device.isDevice) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            } else {
                if (e.keyCode != 116 && e.keyCode != 123) {//F5 && F12
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        },
        keydown : function(e) {
            if (!this.isOn || loadingMgr.isOn) {
                return;
            }
            var keyCode, view;
            keyCode = this.defaultKeySet(e.keyCode);
            
            view = viewMgr.currentView;
            tLog(view.name);
            if (view) {
                view.keydown(keyCode, e);
            }
            this.stopEvent(e);
        },
        defaultKeySet : function(keycode) {
            switch (keycode) {
            case 37:
                return 'left';
            case 39:
                return 'right';
            case 38:
                return 'up';
            case 40:
                return 'down';
            case 13: //Enter
                return 'ok';
            case 8: //Backspace
            case 902:
                return 'back';
            case 27: //ESC
                return 'exit';
            case 80: //P
                return 'play'
            case 82: //R
                return 'red';
            case 71: //G
                return 'green';
            case 66: //B
                return 'blue';
            case 89: //Y
                return 'yellow';
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                return keycode - 48;
            }
        }
};
