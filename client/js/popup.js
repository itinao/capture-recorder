/**
 * Desctop Capture Recorder VIEW MODEL
 */
var desktopCaptureRecorderInstance = null;
var DesktopCaptureRecorderVM = Class.extend({
    bg: chrome.extension.getBackgroundPage(),
    iconPath: {
        stop   : '/img/icon48_stop.png',
        rec    : '/img/icon48_rec.png',
        default: '/img/icon48.png'
    },
    supportVersion: 35,
    notifications: null,

    init: function () {
        this.notifications = ko.observableArray();
        if (!this.bg.captureRecorder) {
            this.bg.captureRecorder = new this.bg.CaptureRecorder();
        }
        this.activate();
    },

    getAppStatus: function () {
        var appStatus = this.bg.captureRecorder && this.bg.captureRecorder.recorderStatus;
        return appStatus || this.bg.captureRecorder.recorderStatusList.ready;
    },

    startRec: function () {
        // 録画開始処理
        var selectScreenTitle = chrome.i18n.getMessage("notification_select_screen_title");
        var selectScreenText = chrome.i18n.getMessage("notification_select_screen_text");
        this.bg.captureRecorder.createNotification({
            title: selectScreenTitle,
            message: selectScreenText
        });
        this.bg.captureRecorder.startRecording(
            function () {
                this.bg.chrome.browserAction.setIcon({
                    path: this.iconPath.stop
                });
                var startCaptureTitle = chrome.i18n.getMessage("notification_select_screen_title");
                var startCaptureText = chrome.i18n.getMessage("notification_select_screen_text");
                this.bg.captureRecorder.createNotification({
                    title: startCaptureTitle,
                    message: startCaptureText
                });
            }.bind(this),
            this.stopRec.bind(this)
        );
    },

    stopRec: function () {
        // 録画停止処理
        this.bg.captureRecorder.isStopStatus = true;
        var stopCaptureTitle = chrome.i18n.getMessage("notification_stop_capture_title");
        var stopCaptureText = chrome.i18n.getMessage("notification_stop_capture_text");
        this.bg.captureRecorder.createNotification({
            title: stopCaptureTitle,
            message: stopCaptureText
        });
        this.bg.captureRecorder.stopRecording(function () {
            this.bg.chrome.browserAction.setIcon({
                path: this.iconPath.default
            });
            var stopCaptureTitle2 = chrome.i18n.getMessage("notification_stop_capture_title2");
            var stopCaptureText2 = chrome.i18n.getMessage("notification_stop_capture_text2");
            this.bg.captureRecorder.createNotification({
                title: stopCaptureTitle2,
                message: stopCaptureText2
            });
        }.bind(this));
    },

    preview: function () {
        window.open(this.bg.captureRecorder.previewVideoUrl, "_blank", "width=960, height=640, menubar=no, status=no, scrollbars=no");
    },

    trash: function () {
        // 初期化処理
        this.bg.chrome.browserAction.setIcon({
            path: this.iconPath.default
        });
        var trashTitle = chrome.i18n.getMessage("notification_trash_title");
        var trashText = chrome.i18n.getMessage("notification_trash_text");

        this.bg.captureRecorder.createNotification({
            title: trashTitle,
            message: trashText
        });
        this.bg.location.reload();
        window.close();
    },

    save: function () {
        var a = this.bg.document.createElement('A');
        a.download = 'desktop-capture-recorder-' + parseInt((new Date) / 1000) + '.webm';
        a.href = this.bg.captureRecorder.previewVideoUrl;
        a.click();
    },

    activate: function () {
        var appStatus = this.getAppStatus();

        switch (appStatus) {
            // 録画前状態
            case this.bg.captureRecorder.recorderStatusList.ready:
                this.startRec();
                window.close();
                break;

                // 録画中状態
            case this.bg.captureRecorder.recorderStatusList.now:
                this.stopRec();
                window.close();
                break;

                // 録画終了状態
            case this.bg.captureRecorder.recorderStatusList.ended:
                // nop
                break;
        }
    },

    createNotification: function (text) {
        this.notifications.removeAll(); // 溜まっちゃうから消しとく
        this.notifications.push({
            text: text
        });
    },

    isSupport: function () {
        var matches = navigator.userAgent.match(/Chrome\/(...)/); // 念のため3桁とる
        if (!matches) {
            return false;
        }
        var version = Number(matches[1]);
        return this.supportVersion < version ? true : false;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    desktopCaptureRecorderInstance = new DesktopCaptureRecorderVM;
    ko.applyBindings(desktopCaptureRecorderInstance);
}, false);