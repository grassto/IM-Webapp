/**
 * Navigation容器，隐藏原本的头，自己写
 */
Ext.define('IMMobile.view.IMMobile', {
    extend: 'Ext.Container',
    xtype: 'IMMobile',

    requires: [
        'Ext.navigation.View',
        'IMMobile.view.main.MainTabPanel',
        
        'IMCommon.utils.SocketEventUtil',
        'IMCommon.enumType.ChatType',
        'IMCommon.enumType.MsgType',
        'IMCommon.enumType.MsgWrapperType',
        'IMCommon.enumType.NoticeType',
        'IMCommon.enumType.SocketEventType',
        'IMCommon.utils.WebSocketUtil',
        'IMCommon.local.LocalDataMgr'
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
            xtype: 'mainTabPanel'
        }]
    }],

    

    initialize() {
        const me = this,
        rctView = Ext.Viewport.lookup('IMMobile').down('#navView').down('IMMobile-MainTabPanel').down('#IMMobile_Chat');

        if(Config.isPhone) {
            Utils.mask(rctView);
            InitDb.initDB((trans) => {
                LocalDataMgr.getRecentChat(trans, function (ta, resultSet) {
                    // <debug>
                    console.log('数据库初始化完毕');
                    // </debug>

                    var rows = resultSet.rows,
                        len = rows.length;

                    if (len > 0) {
                        var recentStore = rctView.getStore(),
                            datas = [],
                            row = {};
                        for (var i = 0; i < len; i++) {
                            row = rows.item(i);
                            if (row.ChatType == ChatType.Group) {
                                if (row.UserIDs && row.UserNames) {
                                    row.mems = [];

                                    var us = row.UserIDs.split(','),
                                        ns = row.UserNames.split(',');

                                    for (var j = 0; j < us.length; j++) {
                                        row.mems.push({
                                            chat_id: row.ChatID,
                                            user_id: us[j], // id
                                            user_name: ns[j] // name
                                        });
                                    }

                                    datas.push({
                                        chat_id: row.ChatID,
                                        name: row.DisplayName,
                                        type: row.ChatType,
                                        status: -2, // 不显示状态
                                        isUnRead: row.UnreadCount > 0,
                                        unReadNum: row.UnreadCount,
                                        last_post_at: new Date(row.LastPostAt),
                                        last_post_name: row.LastUserName,
                                        last_msg_type: row.LastMsgType,
                                        last_post_msg: row.LastMessage,
                                        members: row.mems
                                    });
                                }
                            } else if(row.ChatType == ChatType.Direct) {
                                datas.push({
                                    chat_id: row.ChatID,
                                    name: row.DisplayName,
                                    type: row.ChatType,
                                    status: -2, // 不显示状态
                                    isUnRead: row.UnreadCount > 0,
                                    unReadNum: row.UnreadCount,
                                    last_post_at: new Date(row.LastPostAt),
                                    last_post_name: row.LastUserName,
                                    last_msg_type: row.LastMsgType,
                                    last_post_msg: row.LastMessage,
                                    members: row.mems
                                });
                            }

                        }
                        // <debug>
                        console.log('本地数据库最近会话', datas);
                        // </debug>
                        recentStore.add(datas);
                    }
                    Utils.unMask(rctView);

                    me.openConnection();// 打开连接
                });

            });
        } else {
            me.openConnection();
        }
    },

    // 打开连接，处理缓存数据
    openConnection() {
        WebSocketUtil.initialize(Config.wsGoUrl);
        WebSocketUtil.setEventCallback((msg) => {
            switch (msg.event) {
                case SocketEventType.posted:
                    SocketEventUtil.handleNewPostEvent(msg);
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
        WebSocketUtil.setReconnectCallback(() => {
            User.isFirstCon = true;
        });
    }
});