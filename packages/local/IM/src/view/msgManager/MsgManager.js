Ext.define('IM.view.msgManager.MsgManager', {
    extend: 'Ext.Dialog',
    xtype: 'msgManager',

    controller: 'msgManager',

    title: '消息管理器',
    closable: true,
    resizable: true,
    closeAction: 'hide',
    html: '暂无消息'
});