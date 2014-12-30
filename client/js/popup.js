/**
 * Desctop Capture Recorder VIEW MODEL
 */
var desktopCaptureRecorderInstance = null;
var DesktopCaptureRecorderVM = Class.extend({
  peerConfig: {
    host: 'screen-share-signaling.itinao.asia',
    port: 8080,
    path: '/share',
    debug: 2,
    shareUrl: 'http://screen-share.itinao.asia/share.html'
  },
  bg: chrome.extension.getBackgroundPage(),
  descriptions: {
    ready: '「REC」ボタンを押して<br>録画対象の選択をしてください',
    work: '共有URLを生成しました<br>{{$1}}人が接続中です'
  },
  notificationText: {
    startRec: '録画を開始しました'
  },
  iconPath: {
    start: '/img/icon48_start.png',
    stop: '/img/icon48_stop.png',
    rec: '/img/icon48_rec.png',
    default: '/img/icon48.png'
  },
  readyShareUrl: 'URL',
  supportVersion: 35,

  buttonStatus: {
    startRec: null,
    stopRec: null,
    preview: null,
    trash: null,
    save: null
  },

  captureOnOff: null,
  shareUrl: null,
  shareDescription: null,
  nowCopy: null,
  notifications: null,
  
  init: function() {
    this.captureOnOff = ko.observable();
    this.shareUrl = ko.observable();
    this.shareDescription = ko.observable();
    this.nowCopy = ko.observable();
    this.notifications = ko.observableArray();

    this.buttonStatus.startRec = ko.observable(true);
    this.buttonStatus.stopRec = ko.observable(false);
    this.buttonStatus.preview = ko.observable(false);
    this.buttonStatus.trash = ko.observable(false);
    this.buttonStatus.save = ko.observable(false);

    this.updateButtonState(this.bg.captureRecorder && this.bg.captureRecorder.recorderStatus);

    if (this.isConnected()) {
      this.initConnected();
    } else {
      this.initUnConnected();
    }
  },

  startRec: function() {
    this.bg.captureRecorder = new this.bg.CaptureRecorder();

    this.updateButtonState(this.bg.captureRecorder.recorderStatusList.now);
    this.createNotification(this.notificationText.startRec);
    this.bg.captureRecorder.startRecording(function() {
//      chrome.browserAction.setIcon({path: this.iconPath.stop});
    }.bind(this));
console.log("start");
  },
  stopRec: function() {
    this.updateButtonState(this.bg.captureRecorder.recorderStatusList.ended);
    // 録画停止処理
    this.bg.captureRecorder.stopRecording(function() {});
console.log("stop");
  },
  preview: function() {
    window.open(this.bg.captureRecorder.previewVideoUrl, "_blank", "width=960, height=640, menubar=no, status=no, scrollbars=no");
console.log("preview");
  },
  trash: function() {
    this.updateButtonState(this.bg.captureRecorder.recorderStatusList.ready);
    // 初期化処理
    this.bg.location.reload();
console.log("trash");
  },
  save: function() {
    var a = document.createElement('A');
    a.download = 'desktop-capture-recorder-' + parseInt((new Date) / 1000) + '.webm';
    a.href = this.bg.captureRecorder.previewVideoUrl;
    a.click();
console.log("save");
  },

  updateButtonState: function(buttonStatus) {
    if (!buttonStatus) {
      this.buttonStatus.startRec(true);
      this.buttonStatus.stopRec(false);
      this.buttonStatus.preview(false);
      this.buttonStatus.trash(false);
      this.buttonStatus.save(false);
      return;
    }

    switch (buttonStatus){
      case this.bg.captureRecorder.recorderStatusList.ready:
        this.buttonStatus.startRec(true);
        this.buttonStatus.stopRec(false);
        this.buttonStatus.preview(false);
        this.buttonStatus.trash(false);
        this.buttonStatus.save(false);
        break;
      case this.bg.captureRecorder.recorderStatusList.now:
        this.buttonStatus.startRec(false);
        this.buttonStatus.stopRec(true);
        this.buttonStatus.preview(false);
        this.buttonStatus.trash(false);
        this.buttonStatus.save(false);
        break;
      case this.bg.captureRecorder.recorderStatusList.ended:
        this.buttonStatus.startRec(false);
        this.buttonStatus.stopRec(false);
        this.buttonStatus.preview(true);
        this.buttonStatus.trash(true);
        this.buttonStatus.save(true);
        break;
    }
  },

  isConnected: function() {
    return this.bg.captureRecorder && this.bg.captureRecorder.stream && !this.bg.captureRecorder.stream.ended;
  },

  initConnected: function() {
/*
    var conLen = Object.keys(this.bg.captureRecorder.connections).length;
    this.captureOnOff(true);
*/
//    this.shareDescription(this.descriptions.work.replace('{{$1}}', conLen));
  },

  initUnConnected: function() {
/*
    this.captureOnOff(false);
    this.shareUrl(this.readyShareUrl);
*/
    this.shareDescription(this.descriptions.ready);
  },

  createShortUrl: function() {
  },

  changeCaptureStatus: function(self, event) {
/*
    if (event.currentTarget.checked) {
      // ONに変更時
      this.createPeerInstance(function() {
        setTimeout(function() {// SWITCHのアニメーションを見せてからダイアログ出す
          this.bg.captureRecorder.startCapture();
          window.close();// Windowsではpopupが閉じないので明示的に閉じる
        }.bind(this), 500);
      }.bind(this));
    } else {
      // OFFに変更時
      this.bg.location.reload();
      this.shareUrl(this.readyShareUrl);
      this.shareDescription(this.descriptions.ready);
    }
*/
  },

  createPeerInstance: function(openCallback) {
    this.bg.captureRecorder = new this.bg.CaptureRecorder({
      host: this.peerConfig.host,
      port: this.peerConfig.port,
      path: this.peerConfig.path,
      debug: this.peerConfig.debug,
      shareUrl: this.peerConfig.shareUrl,
      openCallback: openCallback
    });
  },

  createNotification: function(text) {
    this.notifications.removeAll();// 溜まっちゃうから消しとく
    this.notifications.push({text: text});
  },

  isSupport: function() {
    var matches = navigator.userAgent.match(/Chrome\/(...)/);// 念のため3桁とる
    if (!matches) {
      return false;
    }
    var version = Number(matches[1]);
    return this.supportVersion < version ? true : false;
  }
});

document.addEventListener("DOMContentLoaded", function() {
  desktopCaptureRecorderInstance = new DesktopCaptureRecorderVM;
  ko.applyBindings(desktopCaptureRecorderInstance);
}, false);

chrome.browserAction.onClicked.addListener(function() {
console.log("TEST");
alert("test");
})
