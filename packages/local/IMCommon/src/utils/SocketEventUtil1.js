/**
 * IM和IMCommon的公用接收ws后处理数据
 * 之后替换SocketEventUtil.js
 */
Ext.define('IMCommon.utils.SocketEventUtil1', {
    alternateClassName: 'SocketEventUtil1',
    singleton: true,

    /**
     * 接收类型：posted
     * @param {*} msg 消息体
     * @param {*} rctView 最近会话视图
     * @param {*} msgView 消息列表视图
     */
    handleNewPostEvent(msg, rctView, msgView) {
        const me = this,
            data = JSON.parse(msg.data.message);

        // 首先判断发送者，是自己则不处理
        if (data.user_id != User.ownerID) {
            data.user_name = msg.data.sender_name; // 发送者
            data.chat_type = msg.data.chat_type; // 会话类型（D/G）
            data.chat_name = msg.data.chat_name; // 会话名称

            // 本地客户端数据保存,IMMsg,不管怎样都要保存，加一条数据
            LocalDataMgr.addMsgByWS(data);
            // 判断是否在当前会话msg，页面展示
            if(me.inThisChat(msgView, data.chat_id)) {
            }

            // 判断是否存在rct
            if (me.hasRct(rctView, data.chat_id)) {
                LocalDataMgr.updateRctByWsPost(data);
                me.chgRctByWsPost(rctView.getStore(), data);
            } else {
                LocalDataMgr.insertRctByWS(data);
                AddDataUtil.wsAddChatToRct(rctView.getStore(), data); // 添加数据至页面
                me.promptUnRead(data, rctView.getStore());
            }

        }
    },

    /**
     * 是否在当前的聊天页面
     * @param {*} msgView
     * @param {*} chatID
     */
    inThisChat(msgView, chatID) {
        if(msgView && msgView.getStore() && msgView.getStore().storeId == chatID) {
            return true;
        }
        return false;
    },

    /**
     * 根据chatID判断页面上是否有这个chat
     * @param {*} rctView
     * @param {string} chatID
     */
    hasRct(rctView, chatID) {
        var store = rctView.getStore(),
            record = store.getById(chatID);

        if (record) {
            return true;
        }
        return false;
    },

    chgRctByWsPost(store, data) {
        var rec = store.getById(data.chat_id);

        var content = '';
        switch(data.chat_type) {
            case ChatType.Direct:
                content = data.message;
                break;
                case ChatType.Group:
                content = data.user_name
                break;
                default:
                break;
        }

        var msgType = '';
        switch(data.msg_type) {
            case MsgType.TextMsg:
                msgType = MsgType.TextMsg;
                break;
            case MsgType.ImgMsg:
                msgType = MsgType.ImgMsg;
                break;
            case MsgType.FileMsg:
                msgType = MsgType.FileMsg;
        }
        rec.set({
            last_msg_type: msgType, // 先只管文本的
            last_post_msg: content,
            last_post_at: data.create_at,
            last_post_name: data.user_name
        });
    },

    /**
     * 未读提示，根据id找到相应的record并赋值
     * @param {json} data
     * @param {*} store
     */
    promptUnRead(data, store) {
        var record = store.getById(data.chat_id);
        record.set({
            isUnRead: true,
            unReadNum: record.get('unReadNum') + 1,
            last_post_at: new Date(data.update_at)
        });
    },
});