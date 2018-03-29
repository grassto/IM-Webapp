Ext.define('IM.view.middlePanel.MiddlePanel', {
    extend: 'Ext.Panel',
    xtype: 'midPanel',

    layout: 'vbox',
    cls: 'left_panel',
    ui: 'tab',

    items: [{
        xtype: 'container',
        height: 30,
        cls: 'imitateMidTitle',
        bind: {
            hidden: '{isShowBrowseTitle}'
        }
    }, {
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'formpanel', // 搜索框
            reference: 'searchForm',
            flex: 1,
            items: [{
                xtype: 'fieldset',
                items: [{
                    xtype: 'searchfield',
                    placeholder: '搜索',
                    name: 'query'
                }]
            }]
        }, {
            xtype: 'button',
            iconCls: 'x-fa fa-plus',
            handler: 'showGrpSel'
        }]
    }, {
        xtype: 'recentChat',
        itemId: 'recentChat',
        cls: 'left_tab',
        flex: 1
    }, {
        xtype: 'left-organization',
        cls: 'left_tab',
        itemId: 'left-organization',
        hidden: true,
        flex: 1
    }]
});