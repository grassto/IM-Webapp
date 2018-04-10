/**
 * Navigation容器，隐藏原本的头，自己写
 */
Ext.define('IMMobile.view.IMMobile', {
    extend: 'Ext.NavigationView',
    xtype: 'IMMobile',

    requires: [
        'IMMobile.view.IMMobileMain.IMMobileMainTabPanel',
        'IMCommon.utils.WebSocketUtil',

        'IMCommon.enumType.ChatType',
        'IMCommon.enumType.MsgType',
        'IMCommon.enumType.MsgWrapperType',
        'IMCommon.enumType.NoticeType',
        'IMCommon.enumType.SocketEventType'
    ],

    fullscreen: true,
    navigationBar: null,

    items: [{
        xtype: 'IMMobile-MainTabPanel'
    }],

    initialize() {
        this.openConnection();
    },

    // 打开连接，处理缓存数据
    openConnection() {
        WebSocketUtil.initialize(Config.wsGoUrl);
        WebSocketUtil.setEventCallback((msg) => {
            switch (msg.event) {
                case SocketEventType.posted:
                    // SocketEventHelper.handleNewPostEvent(msg);
                    break;
                case SocketEventType.createGrp:
                    // SocketEventHelper.handleGrpAddEvent(msg);
                    break;
                case SocketEventType.memAdd:
                    // SocketEventHelper.handleMemAddEvent(msg);
                    break;
                case SocketEventType.memRemove:
                    // SocketEventHelper.handleMemRemoveEvent(msg);
                    break;
                case SocketEventType.chgManager:
                    // SocketEventHelper.handleMgrChgEvent(msg);
                    break;
                case SocketEventType.updateChat:
                    // SocketEventHelper.handleChgChatHeader(msg);
                    break;
                default:
                    break;
            }
        });
    }

});