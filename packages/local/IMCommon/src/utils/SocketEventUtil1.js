/**
 * IM和IMCommon的公用接收ws后处理数据
 * 之后替换SocketEventUtil.js
 */
Ext.define('IMCommon.utils.SocketEventUtil1', {
    alternateClassName: 'SocketEventUtil1',
    singleton: true,

    /**
     * 接收类型：posted,
     * 更新本地数据库，更新页面值
     * @param {*} msg 消息体
     * @param {*} rctView 最近会话视图
     * @param {*} baseView 用来获取消息列表视图,这个在页面上不一定存在
     */
    handleNewPostEvent(msg, rctView, baseView) {
        const me = this,
            data = JSON.parse(msg.data.message);

        // 首先判断发送者，是自己则不处理
        if (data.user_id != User.ownerID) {
            data.user_name = msg.data.sender_name; // 发送者
            data.chat_type = msg.data.chat_type; // 会话类型（D/G）
            data.chat_name = msg.data.chat_name; // 会话名称

            // 本地客户端数据保存,IMMsg,不管怎样都要保存，加一条数据
            LocalDataMgr.addMsgByWS(data);
            // 本地处理最近会话都放在获得了成员信息后处理
            // LocalDataMgr.handleRctByWsPost(data);

            me.afterHandleRct(me, data, rctView).then((rctRecord) => {
                // 判断是否在当前会话msg，页面展示
                var msgView = me.inThisChat(baseView, data.chat_id);
                if (msgView) {

                    me.addMsgByWsPost(msgView, data);

                    AddDataUtil.onScroll(msgView);

                    me.promptFakeRead(data, msgView.getStore());
                } else {
                    if (rctRecord) { // 不存在最近会话的时候，添加rct后直接给未读
                        me.promptUnRead(data, rctView.getStore());
                    }
                }

                me.notifyWrapper(data);
            }).catch(err => {
                console.log('ws收到通知后，Rct相关出错了', err);
            });
        }
    },

    afterHandleRct(me, data, rctView) {
        // 判断是否存在rct
        return new Ext.Promise((resolve, reject) => {
            var rctRecord = me.hasRct(rctView, data.chat_id);
            if (rctRecord) {
                me.chgRctByWsPost(rctRecord, data); // 更新页面数据
            } else {
                me.addRctByWsPost(rctView.getStore(), data); // 添加最近会话数据至页面
            }

            resolve(rctRecord);
        });
    },

    /**
     * 是否在当前的聊天页面
     * @param {*} baseView
     * @param {*} chatID
     */
    inThisChat(baseView, chatID) {
        var msgView = '';
        if (Config.isPC) {
            // 有这个view、view有store、store的ID正确
            if (baseView && baseView.lookup('im-main')) {
                if(baseView.lookup('im-main').down('#chatView')) {
                    msgView = baseView.lookup('im-main').down('#chatView');
                    if(msgView.getStore()) {
                        if(msgView.getStore().storeId == chatID) {
                            return msgView;
                        }
                    }
                }
            }
        } else if(Config.isPhone) {
            // TODO
        }

        return false;
    },

    /**
     * 根据chatID判断页面上是否有这个chat
     * @param {*} rctView
     * @param {string} chatID
     * @return 存在则返回record，不存在则false
     */
    hasRct(rctView, chatID) {
        var store = rctView.getStore(),
            record = store.getById(chatID);

        if (record) {
            return record;
        }
        return false;
    },

    /**
     * ws收到消息后，将消息添加至页面
     * @param {*} msgView 
     * @param {*} data 
     */
    addMsgByWsPost(msgView, data) {
        var me = this,
            store = msgView.getStore();
        switch (data.msg_type) {
            case MsgType.TextMsg:
                me.addTextMsg(store, data);
                break;
            case MsgType.ImgMsg:
                me.addImgMsg(store, data);
                break;
            case MsgType.FileMsg:
                me.addFileMsg(store, data);
                break;
            default:
                alert('暂未支持该类型：', data.msg_type);
        }
        AddDataUtil.onScroll(msgView);
    },
    addTextMsg(store, data) {
        const text = window.minEmoji(data.message);
        store.add({
            msg_id: data.msg_id,
            msg_type: MsgType.TextMsg,
            senderName: data.user_name,
            sendText: text,
            updateTime: new Date(data.update_at),
            last_post_at: new Date(data.update_at),
            ROL: data.user_id == User.ownerID ? 'right' : ''
        });
    },
    addImgMsg(store, data) {
        var text = ImgMgr.setPicIndex(); // 先占位，再等服务器提示你可以去下载的时候，将其替换
        store.add({
            msg_id: data.msg_id,
            msg_type: MsgType.ImgMsg,
            senderName: data.user_name,
            sendText: text,
            updateTime: new Date(data.update_at),
            last_post_at: new Date(data.update_at),
            ROL: data.user_id == User.ownerID ? 'right' : ''
        });
    },
    addFileMsg(store, data) {
        store.add({
            msg_id: data.msg_id,
            msg_type: MsgType.FileMsg,
            fileID: data.attach_id,
            fileName: data.name,
            fileSize: data.size,
            fileStatus: 2,
            senderName: data.user_name,
            updateTime: new Date(data.update_at),
            last_post_at: new Date(data.update_at),
            ROL: data.user_id == User.ownerID ? 'right' : ''
        });
    },

    /**
     * ws收到消息后，更新页面最近会话,
     * 由于ios不能够使用async:false，所以使用Ext.Promise来同步处理数据
     * @param {*} rctRecord 
     * @param {*} data 
     */
    chgRctByWsPost(rctRecord, data) {
        var me = this;
        data = me.getMsgByType(data);

        me.getChatMems(data).then(res => {
            rctRecord.set({
                last_msg_type: data.msg_type,
                last_post_msg: data.content,
                last_post_at: data.create_at,
                last_post_name: res.members
            });

            data.members = res.members;
            data.chatInfo = res.chat;
            LocalDataMgr.handleRctByWsPost(data);

        }).catch(err => {
            console.log('ws收到消息后，更新会话成员失败', err);
        });
    },

    /**
     * ws收到消息后，页面添加最近会话
     * @param {*} rctStore 
     * @param {*} data 
     */
    addRctByWsPost(rctStore, data) {
        var me = this;
        data = me.getMsgByType(data);

        me.getChatMems(data).then(res => {

            rctStore.insert(0, {
                chat_id: data.chat_id,
                name: data.user_name,
                type: data.chat_type,
                status: 0, // 消息成功态
                chat_name: data.chat_name,
                last_post_at: data.update_at,
                last_post_msg: data.content,
                last_post_name: data.user_name,
                last_msg_type: data.msg_type,
                members: res.members, // 多人会话，需要此信息
                // 新添加的会话，有一个未读
                isUnRead: true,
                unReadNum: 1
            });

            data.chatInfo = res.chat;
            data.members = res.members;
            LocalDataMgr.handleRctByWsPost(data);

        }).catch(err => {
            console.log(err);
        });
    },

    /**
     * 获取展示信息（最近会话列表最后一条消息）
     * @param {*} data
     */
    getMsgByType(data) {
        switch (data.msg_type) {
            case MsgType.TextMsg:
                data.content = data.message;
                break;
            case MsgType.ImgMsg:
                data.content = '[图片]';
                break;
            case MsgType.FileMsg:
                data.content = '[文件]';
                break;
            default:
                break;
        }

        if (data.chat_type == ChatType.Group) {
            data.content = `${data.user_name}：${data.content}`;
        }

        return data;
    },

    /**
     * 获取成员信息
     * @param {*} data 
     */
    getChatMems(data) {
        return new Ext.Promise((resolve, reject) => {
            Utils.ajaxByZY('get', 'users/' + User.ownerID + '/chats/' + data.chat_id, {
                success: function (res) {
                    resolve(res);
                },
                failure: function (err) {
                    reject(err);
                }
            });
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

    /**
     * 在当前频道，有未读数量，但是不展示
     * @param {*} data 
     * @param {*} store 
     */
    promptFakeRead(data, store) {
        var record = store.getById(data.chat_id);
        record.set({
            isUnRead: false,
            unReadNum: record.get('unReadNum') + 1,
            last_post_at: new Date(data.update_at)
        });
    },

    /**
     * ws收到消息时，提示信息，
     * PC端和移动端
     * @param {*} data
     */
    notifyWrapper(data) {
        if (Config.isPC) {
            CEFHelper.addNotice(data);
        } else if (Config.isPhone) {

        }
    }
});