/**
 * CaptureRecorder
 */
var CaptureRecorder = Class.extend({
  stream: null,
  recordRtc: null,
  previewVideoUrl: null,
  recorderStatusList: {
    ready: 0,
    now: 1,
    ended: 2
  },
  recorderStatus: null,
  startTime: null,
  recTimeLimit: 5,
  isStopButton: false,

  init: function(option) {
    this.recorderStatus = this.recorderStatusList.ready;
  },

  // キャプチャの共有を開始する
  startCapture: function(callback, endCallback) {
    chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window"] , //ウィンドウとデスクトップどちらも
      function(streamId) {
        if (!streamId) {
          // error
          return;
        }
        navigator.webkitGetUserMedia(
          {
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
                minWidth: 10,
                minHeight: 10,
                maxWidth: 1920,
                maxHeight: 1080
              }
            }
          },
          function(stream) {
            this.stream = stream;
            this.recordRtc = RecordRTC(stream, {
              type: 'video',
              video: {
                 width: 1280,
                 height: 960
              },
              canvas: {
                 width: 1280,
                 height: 960
              }
            });

            this.startTimer(endCallback);

            callback && callback();
          }.bind(this),
          function(error) {
            console.log(error);
          }
        );
      }.bind(this)
    );
  },

  // start timer
  startTimer: function(callback) {
    this.startTime = new Date / 1000;// スタート時間
    setTimeout(this.checkTimer.bind(this, callback), 1000);
  },

  // check timer
  checkTimer: function(callback) {
    if (this.isStopButton) {
      return;
    }

    var recTime = (new Date / 1000) - this.startTime;
    if (this.recTimeLimit < recTime) {
      callback && callback();
      return;
    }

    setTimeout(this.checkTimer.bind(this, callback), 1000);
  },

  // Desctop通知
  createNotification: function(option, callback) {
    chrome.notifications.create('', {
        title: option.title,
        message: option.message,
        type: 'basic',
        iconUrl: 'img/icon.png'
      },
      function(id){
        callback && callback();
      }
    );
  },

  // 録画スタート
  startRecording: function(callback, endCallback) {
    this.startCapture(function() {
        this.recordRtc.startRecording();
        this.recorderStatus = this.recorderStatusList.now;
        callback && callback();
    }.bind(this), endCallback);
  },

  // 録画ストップ
  stopRecording: function(callback) {
    this.recordRtc.stopRecording(function(videoUrl) {
      this.stream.stop();
      this.recorderStatus = this.recorderStatusList.ended;
      this.previewVideoUrl = videoUrl;
      callback && callback();
    }.bind(this));
  }
});
