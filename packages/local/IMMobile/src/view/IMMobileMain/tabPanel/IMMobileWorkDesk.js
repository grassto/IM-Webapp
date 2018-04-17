Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileWorkDesk', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-WorkDesk',

    requires: [
        'IMMobile.view.widget.Navbar',
        'IMMobile.view.base.Container',
        'IMMobile.view.base.button.ArrowButton'
    ],

    flex: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        backBtn: false,
        titleMsg: '工作台'
    }, {
        xtype: 'baseBackcolor',
        margin: '10px',
        items: [{
            xtype: 'arrButton',
            iconCls: '',
            arrText: '公告'
        }, {
            xtype: 'arrButton',
            iconCls: '',
            arrText: '消息中心'
        }]
    }]
});