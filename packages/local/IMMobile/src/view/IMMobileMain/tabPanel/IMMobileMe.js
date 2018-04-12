Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileMe', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-Me',

    controller: 'IMMobileMeController',

    requires: [
        'IMMobile.view.widget.Navbar',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController'
    ],

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        backBtn: false,
        titleMsg: '我'
    }, {
        xtype: 'panel',
        html: 'fdsag',
        margin: '5px 10px'
    }, {
        xtype: 'panel'
    }, {
        xtype: 'panel'
    }]
});