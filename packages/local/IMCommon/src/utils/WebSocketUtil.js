Ext.define('IMCommon.utils.WebSocketUtil', {
  alternateClassName: 'WebSocketUtil',
  singleton: true,

  MAX_WEBSOCKET_FAILS: 7,
  MIN_WEBSOCKET_RETRY_TIME: 3000, // 3 sec
  MAX_WEBSOCKET_RETRY_TIME: 300000, // 5 mins

  conn: null,
  sequence: 1,
  eventSequence: 0,
  connectFailCount: 0,
  eventCallback: null, // 处理消息
  responseCallbacks: {}, // 回应
  firstConnectCallback: null, // 初次连接回调
  reconnectCallback: null, // 重连回调
  missedEventCallback: null, // 未知回调
  errorCallback: null, // 错误回调
  closeCallback: null, // 关闭回调
  initialize(connectionUrl, token) {
    // debugger;
    if (this.conn) {
      return;
    }
    if (connectionUrl == null) {
      console.log('connectionUrl 不能为空');
      return;
    }
    if (this.connectFailCount === 0) {
      console.log('websocket 正在连接 ' + connectionUrl);
    }
    this.conn = new WebSocket(connectionUrl + '?token=' + User.token);
    this.connectionUrl = connectionUrl;

    this.conn.onopen = () => {
      this.eventSequence = 0;
      if (token) {
        // 还不知道token有啥用
      }

      if (this.connectFailCount > 0) {
        console.log('websocket 重新创建连接');
        if (this.reconnectCallback) {
          this.reconnectCallback();
        }
      } else if (this.firstConnectCallback) {
        this.firstConnectCallback();
      }
      this.connectFailCount = 0;
    };

    this.conn.onclose = () => {
      this.conn = null;
      this.sequence = 1;
      if (this.connectFailCount === 0) {
        console.log('websocket 关闭');
      }

      this.connectFailCount++;

      if (this.closeCallback) {
        this.closeCallback(this.connectFailCount);
      }

      let retryTime = this.MIN_WEBSOCKET_RETRY_TIME;

      if (this.connectFailCount > this.MAX_WEBSOCKET_FAILS) {
        retryTime = this.MIN_WEBSOCKET_RETRY_TIME * this.connectFailCount * this.connectFailCount;
        if (retryTime > this.MAX_WEBSOCKET_RETRY_TIME) {
          retryTime = this.MAX_WEBSOCKET_RETRY_TIME;
        }
      }

      setTimeout(() => {
        this.initialize(connectionUrl, token);
      }, retryTime);
    };

    this.conn.onerror = (evt) => {
      if (this.connectFailCount <= 1) {
        console.log('websocket 发生异常');
        console.log(evt);
      }

      if (this.errorCallback) {
        this.errorCallback(evt);
      }
    };

    this.conn.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      console.log('websocket接收到的信息');
      console.log(msg);
      if (msg.seq_reply) {
        if (msg.error) {
          console.log(msg);
        }

        if (this.responseCallbacks[msg.seq_reply]) {
          this.responseCallbacks[msg.seq_reply](msg);
          Reflect.deleteProperty(this.reconnectCallback, msg.seq_reply); // ???????
        }
      } else if (this.eventCallback) {
        if (msg.seq !== this.eventSequence && this.missedEventCallback) {
          console.log('missed websocket event, act_seq=' + msg.seq + ' exp_seq=' + this.eventSequence);
          this.missedEventCallback();
        }
        this.eventSequence = msg.seq + 1;
        this.eventCallback(msg);
      }
    };
  },
  setEventCallback(callback) {
    this.eventCallback = callback;
  },
  setFirstConnectCallback(callback) {
    this.firstConnectCallback = callback;
  },
  setReconnectCallback(callback) {
    this.reconnectCallback = callback;
  },
  setMissedEventCallback(callback) {
    this.missedEventCallback = callback;
  },
  setErrorCallback(callback) {
    this.errorCallback = callback;
  },
  setCloseCallback(callback) {
    this.closeCallback = callback;
  },
  close() {
    this.connectFailCount = 0;
    this.sequence = 1;
    if (this.conn && this.conn.readyState === WebSocket.OPEN) {
      this.conn.onclose = () => { };
      this.conn.close();
      this.conn = null;
      console.log('websocket 关闭');
    }
  },
  sendMessage(action, data, responseCallback) {
    const msg = {
      action,
      seq: this.sequence++,
      data
    };

    if (responseCallback) {
      this.responseCallbacks[msg.seq] = responseCallback;
    }

    if (this.conn && this.conn.readyState === WebSocket.OPEN) {
      this.conn.send(JSON.stringify(msg));
    } else if (!this.conn || this.conn.readyState === WebSocket.CLOSED) {
      this.conn = null;
      this.initialize();
    }
  }
});