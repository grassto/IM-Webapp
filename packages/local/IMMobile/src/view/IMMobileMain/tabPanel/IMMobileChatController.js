Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IMMobileChatController',

    requires: [
        'IMCommon.local.InitDb'
    ],

    uses: [
        'IMMobile.view.chatView.IMMobileChatView',
        'IMMobile.view.group.GroupSelList'
    ],
    /**
     * Called when the view is created
     */
    init: function () {
        if (User.isFirstConRct) {
            User.isFirstConRct = false;

            var me = this,
                view = me.getView();
            // 先从本地数据库拉取数据
            if (Config.isPhone) {
                Utils.mask(view);
                // 确保数据库初始化完成后，进行数据绑定
                InitDb.initDB((trans) => {
                    LocalDataMgr.getRecentChat(trans, function (ta, resultSet) {
                        var rows = resultSet.rows,
                            len = rows.length,
                            store = view.getStore();
                        if (len > 0) {
                            var datas = [],
                                row = {};
                            for (var i = 0; i < len; i++) {
                                row = rows.item(i);
                                if (row.ChatType == ChatType.Group) {
                                    row.mems = [];
                                    var us = row.UserIDs.split(','),
                                        ns = row.UserNames.split(',');

                                    for (var j = 0; j < us.length; j++) {
                                        row.mems.push({
                                            chat_id: row.ChatID,
                                            user_id: us[i], // id
                                            user_name: ns[i] // name
                                        });
                                    }
                                }
                                datas.push({
                                    chat_id: row.ChatID,
                                    name: row.DisplayName,
                                    type: row.ChatType,
                                    status: -2, // 不显示状态
                                    isUnRead: row.UnreadCount > 0,
                                    unReadNum: row.UnreadCount,
                                    last_post_at: row.LastPostAt,
                                    last_post_userName: row.LastUserName,
                                    last_msg_type: row.LastMsgType,
                                    last_post_msg: row.LastMsg,
                                    members: row.mems
                                });
                            }
                            store.add(datas);
                        }
                        Utils.unMask(view);

                        // 获取未读会话进行绑定
                        me.getUnreadChats(store);
                    });
                });
            } else {
                this.getAllChats();
            }
        }

    },

    /**
     * 获取未读会话进行绑定
     * @param {*} store 
     */
    getUnreadChats(store) {
        Utils.ajaxByZY('GET', 'users/me/chats/unread', {
            success: function (data) {
                if (data) {
                    console.log('未读会话', data);

                    LocalDataMgr.initUpdateChats(data);

                    // 添加数据至store
                    var chat, displayName;
                    for (var i = 0; i < data.length; i++) {
                        chat = data[i].chat,
                            displayName = chat.chat_type == ChatType.Direct ? ParseUtil.parseDirectChatName(data[i], User.ownerID) : chat.header;
                        store.insert(0, {
                            chat_id: chat.chat_id,
                            name: displayName,
                            type: chat.chat_type,
                            status: -2, // 不显示状态
                            isUnRead: chat.unread_count > 0,
                            unReadNum: chat.unread_count,
                            last_post_at: chat.last_post_at,
                            last_post_userName: chat.last_sender_name,
                            last_msg_type: chat.last_msg_type,
                            last_post_msg: chat.last_message,
                            members: data[i].members
                        });
                    }

                }
            }
        });
    },

    // getLocalChats() {
    //     LocalDataMgr.getRecentChat(this.bindLocalChats);
    // },

    // // 处理数据绑定，作用域不在当前
    // bindLocalChats(trans, resultSet) {
    //     var rows = resultSet.rows,
    //         len = rows.length;

    //     var recentStore = Ext.Viewport.lookup('IMMobile').down('#navView').down('IMMobile-Chat').down('#ChatList').getStore(),
    //         datas = [],
    //         row = {};
    //     for (var i = 0; i < len; i++) {
    //         row = rows.item(i);
    //         datas.push({
    //             id: row.ChatID,
    //             name: row.DisplayName,
    //             type: row.ChatType,
    //             status: -2, // 不显示状态
    //             isUnRead: row.UnreadCount > 0,
    //             unReadNum: row.UnreadCount,
    //             last_post_at: row.LastPostAt
    //         });
    //     }
    //     recentStore.add(datas);
    // },


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

    // 这边不要了
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
        if (Ext.browser.is.Cordova) {
            LocalDataMgr.updateRctChat(localDatas);
        }
    },

    // 选中最近会话
    onSelChatList(view, location) {
        if (location.record.data.unReadNum !== 0) {
            this.setUnReadToRead(location.record);
            if (Config.isPhone) {
                LocalDataMgr.rctSetUnreadToRead(location.record.data.chat_id);
            }
        }

        User.crtChannelId = location.record.data.chat_id;

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

    // 跳转到群聊选人页面
    onStartGrpChat() {
        Redirect.redirectTo('IMMobile-grpSelList');
        // const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        // imMobile.push({
        //     xtype: 'IMMobile-grpSelList',
        //     itemId: 'IMMobile-grpSelList'
        // });
    }

});