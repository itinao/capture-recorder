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
    clip: 'クリップボードにコピーしました'
  },
  readyShareUrl: 'URL',
  supportVersion: 35,

  buttonStatus: {
    rec: null,
    stop: null,
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

    this.buttonStatus.rec = ko.observable(true);
    this.buttonStatus.stop = ko.observable(false);
    this.buttonStatus.preview = ko.observable(false);
    this.buttonStatus.trash = ko.observable(false);
    this.buttonStatus.save = ko.observable(false);

    if (this.isConnected()) {
      this.initConnected();
    } else {
      this.initUnConnected();
    }
  },

  isConnected: function() {
    return this.bg.appPeer && this.bg.appPeer.stream && !this.bg.appPeer.stream.ended;
  },

  initConnected: function() {
    var conLen = Object.keys(this.bg.appPeer.connections).length;
    this.captureOnOff(true);
    this.shareDescription(this.descriptions.work.replace('{{$1}}', conLen));
  },

  initUnConnected: function() {
    this.captureOnOff(false);
    this.shareUrl(this.readyShareUrl);
    this.shareDescription(this.descriptions.ready);
  },

  createShortUrl: function() {
    // 短縮URLを取得する
    gapi.client.load('urlshortener', 'v1', function() {
      var req = gapi.client.urlshortener.url.insert({
        resource: {'longUrl': this.bg.appPeer.shareUrl}
      });
      req.execute(function(data){
        if (data.error) {
          this.shareUrl(this.bg.appPeer.shareUrl);
          return;
        }
        this.shareUrl(data.id);
      }.bind(this));
    }.bind(this));
  },

  changeCaptureStatus: function(self, event) {
    if (event.currentTarget.checked) {
      // ONに変更時
      this.createPeerInstance(function() {
        setTimeout(function() {// SWITCHのアニメーションを見せてからダイアログ出す
          this.bg.appPeer.startCapture();
          window.close();// Windowsではpopupが閉じないので明示的に閉じる
        }.bind(this), 500);
      }.bind(this));
    } else {
      // OFFに変更時
      this.bg.location.reload();
      this.shareUrl(this.readyShareUrl);
      this.shareDescription(this.descriptions.ready);
    }
  },

  createPeerInstance: function(openCallback) {
    this.bg.appPeer = new this.bg.AppPeer({
      host: this.peerConfig.host,
      port: this.peerConfig.port,
      path: this.peerConfig.path,
      debug: this.peerConfig.debug,
      shareUrl: this.peerConfig.shareUrl,
      openCallback: openCallback
    });
  },

  saveToClipboard: function(value) {
    var textArea = document.createElement("textarea");
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.value = value;
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  },

  copyUrl: function() {
    this.nowCopy(true);
    this.saveToClipboard(this.shareUrl());
    setTimeout(function() {
      this.nowCopy(false);
    }.bind(this), 200);
    this.createNotification();
  },

  createNotification: function() {
    this.notifications.removeAll();// 溜まっちゃうから消しとく
    this.notifications.push({text: this.notificationText.clip});
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

var load = function() {
  if (desktopCaptureRecorderInstance.isConnected()) {
    desktopCaptureRecorderInstance.createShortUrl();
  }
};
