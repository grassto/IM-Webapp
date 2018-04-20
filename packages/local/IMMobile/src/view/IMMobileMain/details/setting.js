Ext.define('IMMobile.view.IMMobileMain.details.setting', {
    extend: 'IMMobile.view.base.Container',
    xtype: 'IMMobile-Setting',

    requires: [
        'IMMobile.view.base.button.ArrowButton',
        'IMMobile.view.widget.Navbar'
    ],

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        titleMsg: '设置'
    }, {
        xtype: 'baseBackcolor',
        flex: 1,
        items: [{
            xtype: 'arrButton',
            arrText: '意见'
        }, {
            xtype: 'arrButton',
            arrText: '帮助中心'
        }, {
            xtype: 'arrButton',
            arrText: '关于'
        }, {
            xtype: 'button',
            width: '100%',
            text: '退出登录'
        }]
    }]

});