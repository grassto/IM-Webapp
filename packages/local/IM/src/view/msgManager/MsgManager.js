Ext.define('IM.view.msgManager.MsgManager', {
    extend: 'Ext.Dialog',
    xtype: 'msgManager',

    controller: 'msgManager',

    title: '消息管理器',
    closable: true,
    resizable: true,
    closeAction: 'hide',
    // html: '暂无消息',

    constructor(config) {
        config = config || {};
        config.items = [{
            width: '70pv',
            height: '70pw'
        }];

        this.callParent([{
            config
        }]);
    }
});