Ext.define('IM.view.msgManager.msgView.MsgView', {
    extend: 'Ext.tab.Panel',
    xtype: 'msgView',

    defaults: {
        tab: {
            iconAlign: 'top'
        }
    },
    tabBar: {
        cls: 'light-shadow',
        layout: {
            pack: 'center'
        }
    },
    items: [{
        title: '消息'
    }, {
        title: '图片'
    }, {
        title: '文件'
    }]
});