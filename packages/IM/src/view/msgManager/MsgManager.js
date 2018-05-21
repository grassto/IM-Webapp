Ext.define('IM.view.msgManager.MsgManager', {
    extend: 'Ext.Dialog',
    xtype: 'msgManager',

    requires: [
        'IM.view.msgManager.msgManagerController',
        'IM.view.widget.MsgSearchField',
        'IM.view.msgManager.list.msgList',
        'IM.view.msgManager.msgView.MsgView'
    ],

    controller: 'msgManager',

    title: '消息管理器',
    closable: true,
    resizable: true,
    closeAction: 'hide',
    height: '90vh',
    maxWidth: '90vw',
    layout: 'fit',

    constructor(config) {
        config = config || {};
        config.items = [{
            xtype: 'container',
            layout: 'hbox',
            padding: 20,
            items: [{
                xtype: 'container',
                layout: 'vbox',
                userCls: 'left_msgMgr',
                minWidth: 300,
                items: [{ // 搜索
                    xtype: 'IM_msgSearch_textfield',
                    itemId: 'msgSearchTxt'
                }, { // list
                    xtype: 'msgList',
                    itemId: 'msgRecentChat',
                    flex: 1
                }]
            }, {
                // html: '<div style="color:#aaa;">暂无结果</div>',
                xtype: 'msg_View',
                style: {
                    paddingLeft: '10px'
                },
                minWidth: 300
            }]
        }];

        this.callParent([
            config
        ]);
    },

    listeners: {
        beforehide: 'msgBeforeHide'
    }
});