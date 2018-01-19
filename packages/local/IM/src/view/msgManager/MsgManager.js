Ext.define('IM.view.msgManager.MsgManager', {
    extend: 'Ext.Dialog',
    xtype: 'msgManager',

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
                items: [{ // 搜索
                    xtype: 'IM_msgSearch_textfield',
                    itemId: 'msgSearchTxt'
                }, { // list
                    xtype: 'groupSel-organization',
                    flex: 1
                }]
            }, {
                html: '赞无结果',
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