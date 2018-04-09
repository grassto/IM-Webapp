Ext.define('IMMobile.view.IMMobile', {
    extend: 'Ext.Container',
    xtype: 'IMMobile',

    requires: [
        'IMMobile.view.IMMobileHeader.IMMobileHeader',
        'IMMobile.view.IMMobileMain.IMMobileMain'
    ],
    
    layout: 'vbox',
    
    // 分为上下两个容器
    items: [{
        xtype: 'IMMobileHeader',
        height: 30
    }, {
        xtype: 'IMMobileMain',
        flex: 1
    }]
});