Ext.define('IM.view.rightContainer.BlankPage', {
    extend: 'Ext.panel.Panel',
    xtype: 'pageblank',

    requires: [
        'Ext.layout.VBox'
    ],

    layout: 'vbox',

    items: [{
        xtype: 'container',
        cls: 'imitateBrowse',
        bind: {
            hidden: '{isShowBrowseTitle}'
        },
        height: 30,
        items: [{
            xtype: 'button',
            ui: 'flat',
            docked: 'right',
            iconCls: 'x-fa fa-remove'
        }, {
            xtype: 'button',
            ui: 'flat',
            docked: 'right',
            iconCls: 'x-fa fa-window-maximize'
        }, {
            xtype: 'button',
            ui: 'flat',
            docked: 'right',
            iconCls: 'x-fa fa-window-minimize'
        }]
    }, {
        flex: 1,
        layout: {
            type: 'vbox',
            pack: 'center',
            align: 'center'
        },
        cls: 'blank-page-container',
        html: '<div class=\'fa-outer-class\'><span class=\'x-fa fa-clock-o\'></span></div>' +
            '<h1>未选择聊天!</h1><span class=\'blank-page-text\'></span>'
    }]
});