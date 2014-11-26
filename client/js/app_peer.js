/**
 * PeerJSを操作するクラス
 */
var AppPeer = Class.extend({
  // PeerJS接続情報の保持
  peer: null,
  connections: {},
  mediaConnections: {},
  stream: null,

  // Share用URL保持
  shareBaseUrl: null,
  shareUrl: null,

  init: function(option) {
    this.shareBaseUrl = option.shareUrl;
    this.peer = new Peer({host: option.host, port: option.port, path: option.path, debug: option.debug});
    this.peer.on('open', this.onOpen.bind(this, option.openCallback));
    this.peer.on('error', this.onError.bind(this));
    this.peer.on('connection', this.onConnection.bind(this));
  },

  // シェア用のURLを設定する
  setShareUrl: function(id) {
    this.shareUrl = this.shareBaseUrl + '?id=' + id;
  },

  // PeerJS Serverへの接続完了イベント
  onOpen: function(callback, id) {
    console.log("open: " + id);
    this.setShareUrl(id);
    callback && callback();
  },

  // PeerJS Serverへの接続失敗イベント
  onError: function(error) {
    console.log(error);
  },

  // PeerJS Serverのコネクション完了イベント
  onConnection: function(connection) {
    console.log("connection: " + connection.peer);
    connection = this.addConnectionEvent(connection);
    this.connections[connection.peer] = connection;
  },

  // コネクション確立時に各種イベントをセットする
  addConnectionEvent: function(connection) {
    connection.on('open', this.onOpenFromPartner.bind(this, connection));
    connection.on('data', this.onDataFromPartner.bind(this, connection));
    connection.on('close', this.onCloseFromPartner.bind(this, connection));
    return connection;
  },

  // パートナーの接続イベント
  onOpenFromPartner: function(connection) {
    console.log('open partner: ' + connection.peer);
    var mediaConnection = this.peer.call(connection.peer, this.stream);
    this.mediaConnections[connection.peer] = mediaConnection;

    // Desctop通知
    var conLen = Object.keys(this.connections).length;
    this.createNotification({title: '他ユーザーが共有URLを開きました', message: '{{$1}}人が閲覧中です'.replace('{{$1}}', conLen)});
  },

  // パートナーから送られてきたデータの受信イベント
  onDataFromPartner: function(connection, data) {
    console.log(data);
  },

  // パートナーの切断イベント
  onCloseFromPartner: function(connection) {
    console.log('close partner: ' + connection.peer);
    // 切断したユーザー情報を削除する
    delete this.connections[connection.peer];
  },

  // キャプチャの共有を開始する
  startCapture: function(callback) {
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
            this.createNotification({title: '共有が完了しました', message: '拡張機能からURLを確認してください'});
            callback && callback();
          }.bind(this),
          function(error) {
            console.log(error);
          }
        );
      }.bind(this)
    );
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
  }
});
