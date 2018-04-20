/**
 * Navigation容器，隐藏原本的头，自己写
 */
Ext.define('IMMobile.view.IMMobile', {
    extend: 'Ext.Container',
    xtype: 'IMMobile',

    requires: [
        'Ext.navigation.View',
        'IMMobile.view.IMMobileMain.IMMobileMainTabPanel',
        
        'IMCommon.enumType.ChatType',
        'IMCommon.enumType.MsgType',
        'IMCommon.enumType.MsgWrapperType',
        'IMCommon.enumType.NoticeType',
        'IMCommon.enumType.SocketEventType',
        'IMCommon.utils.WebSocketUtil'
    ],

    uses: [
        'IMCommon.utils.AvatarUtil',
        'IMCommon.utils.ParseUtil'
    ],

    cls: 'mobileMain',

    // 套上一层container是为了在页面跳转的时候不出错
    items: [{
        xtype: 'navigationview',
        itemId: 'navView',
        fullscreen: true,
        navigationBar: null,

        items: [{
            xtype: 'IMMobile-MainTabPanel'
        }]
    }],

    

    initialize() {
        this.openConnection();
        this.getMe();
    },
    getMe() {
        Utils.ajaxByZY('GET', 'users/me', {
            success: function (data) {
                User.crtUser = data;
            }
        });
    },

    // 打开连接，处理缓存数据
    openConnection() {
        const me = this;
        WebSocketUtil.initialize(Config.wsGoUrl);
        WebSocketUtil.setEventCallback((msg) => {
            switch (msg.event) {
                case SocketEventType.posted:
                    me.handleNewPostEvent(msg);
                    break;
                case SocketEventType.createGrp:
                    // SocketEventUtil.handleGrpAddEvent(msg);
                    break;
                case SocketEventType.memAdd:
                    // SocketEventUtil.handleMemAddEvent(msg);
                    break;
                case SocketEventType.memRemove:
                    // SocketEventUtil.handleMemRemoveEvent(msg);
                    break;
                case SocketEventType.chgManager:
                    // SocketEventUtil.handleMgrChgEvent(msg);
                    break;
                case SocketEventType.updateChat:
                    // SocketEventUtil.handleChgChatHeader(msg);
                    break;
                default:
                    break;
            }
        });
    },

    handleNewPostEvent(msg) {
        // debugger;
        const me = this,
            data = JSON.parse(msg.data.message),
            userName = AddDataUtil.getName(data.user_id);

        // 自己发送的就在本地展示
        if (data.user_id != User.ownerID) {
            // 区分一个在当前页面，和不在当前页面
            const view = Ext.Viewport.lookup('IMMobile'), // 总容器
                recentChat = view.down('#ChatList'), // 最近会话
                chatView = view.down('#IMMobile-chatView'); // 聊天页面
            if (chatView && User.crtChannelId == data.chat_id) { // 有这个页面并且是当前会话
                var text = data.message;
                text = window.minEmoji(text);
                text = ParseUtil.parsePic(text, data.attach_id);

                var store = chatView.down('#IMMobileChatView').getStore();

                store.add({
                    senderName: userName,
                    sendText: text,
                    updateTime: new Date(data.update_at)
                });
            } else { // 不在当前会话
                // 判断频道，没有，加
                var has = me.hasChat(data.chat_id);
                if(!has) {
                    AddDataUtil.addChatToRecent(data.chat_id);
                }

                // 提示未读
                me.promptUnRead(data.chat_id, recentChat);
            }
        }

    },

    hasChat(cid) {
        var flag = false;
        for (var i = 0; i < User.allChannels.length; i++) {
            if(User.allChannels[i].chat.chat_id == cid) {
                flag = true;
                break;
            }
        }

        return flag;
    },

    promptUnRead(cid, view) {
        var store = view.getStore(),
            record = store.getById(cid);
        record.set('isUnRead', true);
        record.set('unReadNum', record.get('unReadNum') + 1);
    }
});