Ext.define('IMMobile.view.IMMobileHeader.IMMobileHeader', {
    extend: 'Ext.Container',
    xtype: 'IMMobileHeader',
    requires: [
        'Ext.Button'
    ],

    layout: 'hbox',

    items: [{
        xtype: 'component',
        html: '普实软件'
    }, {
        xtype: 'component',
        flex: 1
    }, { // 这边的两个按钮需要一定的操作
        xtype: 'button',
        ui: 'flat',
        iconCls: 'x-fa fa-search',
        itemId: ''
    }, {
        xtype: 'button',
        ui: 'flat',
        iconCls: 'x-fa fa-plus'
    }]
});