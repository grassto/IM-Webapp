Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IMMobileChatController',

    uses: [
        'IMMobile.view.chatView.IMMobileChatView',
        'IMMobile.view.group.GroupSelList'
    ],
    /**
     * Called when the view is created
     */
    init: function () {
        // 先从本地数据库拉取数据
        this.getLocalChats();
        this.getAllChats();
    },

    getLocalChats() {
        LocalDataMgr.getRecentChat(this.bindLocalChats);
    },

    // 处理数据绑定，作用域不在当前
    bindLocalChats(trans, resultSet) {
        var rows = resultSet.rows,
        len = rows.length;

        var recentStore = Ext.Viewport.lookup('IMMobile').down('#navView').down('IMMobile-Chat').down('#ChatList').getStore(),
        datas = [],
        row = {};
        for(var i = 0; i < len; i++) {
            row = rows.items(i);
            datas.push({
                id: row.ChatID,
                name: row.DisplayName,
                type: row.ChatType,
                status: -2, // 不显示状态
                isUnRead: row.UnreadCount > 0,
                unReadNum: row.UnreadCount,
                last_post_at: row.LastPostAt
            });
        }
        recentStore.add(datas);
    },


    getAllChats() {
        const me = this,
            view = me.getView();

        Utils.mask(view);
        Utils.ajaxByZY('get', 'users/me/chats', {
            success: function (data) {
                console.log('所有频道：', data);

                me.pushChatToCache(data);

                me.bindAllChats();

                Utils.unMask(view);
            }
        });
    },

    pushChatToCache(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].chat.chat_type == 'D') { // 单人会话
                // chat_name为C1034__C1064这种，将其拼凑为姓名
                for (let j = 0; j < User.allOthers.length; j++) {
                    if (data[i].chat.chat_name.indexOf(User.allOthers[j].user_id) > -1) {
                        data[i].chat.channelname = User.allOthers[j].user_name;
                        User.allChannels.push(data[i]);
                        break;
                    }
                }
            }
            else {
                data[i].chat.channelname = data[i].chat.header;
                User.allChannels.push(data[i]);
            }
        }
    },

    bindAllChats() {
        var localDatas = []; // 用来存放本地所没有的会话

        var me = this,
            view = me.getView(),
            store = view.down('#ChatList').getStore(),
            isUnRead = false,
            status;
        for (let i = 0; i < User.allChannels.length; i++) {
            // 本地数据，使用last_post_at来作为判断依据，不科学
            // 还是使用unRead，让服务端去组织
            

            // 状态
            if (User.allChannels[i].chat.chat_type == ChatType.Direct) {
                // status = StatusHelper.getStatus(StatusHelper.getUserIDByChatName(User.allChannels[i].chat.chat_name));
            } else {
                status = '不显示';
            }

            // 未读
            if (User.allChannels[i].chat.unread_count > 0) {
                isUnRead = true;
                localDatas.push(User.allChannels[i]);
            } else {
                isUnRead = false;
            }

            store.add({
                id: User.allChannels[i].chat.chat_id,
                name: User.allChannels[i].chat.channelname,
                type: User.allChannels[i].chat.chat_type,
                status: status,
                chat_name: User.allChannels[i].chat.chat_name,
                isUnRead: isUnRead,
                unReadNum: User.allChannels[i].chat.unread_count,
                last_post_at: new Date(User.allChannels[i].chat.last_post_at)
            });
        }

        // 处理本地数据库数据
        LocalDataMgr.updateRctChat(localDatas);
    },

    onSelChatList(view, location) {
        if(location.record.data.unReadNum !== 0) {
            this.setUnReadToRead(location.record);
        }

        User.crtChannelId = location.record.data.id;

        User.crtChatName = location.record.data.name;


        Redirect.redirectTo('IMMobile-chatView');
        // const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        // imMobile.push({
        //     xtype: 'IMMobile-chatView',
        //     itemId: 'IMMobile-chatView'
        // });
    },

    /**
     * 将未读消息设为已读
     * @param {Ext.data.Model} record 当前选中的chat_id的store的数据
     */
    setUnReadToRead(record) {

        Utils.ajaxByZY('post', 'chats/members/' + User.ownerID + '/view', {
            params: JSON.stringify({ chat_id: record.data.id }),
            success: function (data) {
                if (data.Status == 'OK') {
                    record.set('isUnRead', false);
                    record.set('unReadNum', 0);
                }
            }
        });

    },


    onStartGrpChat() {
        Redirect.redirectTo('IMMobile-grpSelList');
        // const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        // imMobile.push({
        //     xtype: 'IMMobile-grpSelList',
        //     itemId: 'IMMobile-grpSelList'
        // });
    }

});