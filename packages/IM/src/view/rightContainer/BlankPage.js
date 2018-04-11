Ext.define('IM.view.rightContainer.BlankPage', {
    extend: 'Ext.panel.Panel',
    xtype: 'pageblank',

    requires: [
        'Ext.layout.VBox'
    ],

    defaultListenerScope: true,
    layout: 'vbox',

    items: [{
        xtype: 'container',
        layout: 'hbox',
        bind: {
            hidden: '{isHideBrowseTitle}'
        },
        height: 25,
        items: [{
            xtype: 'component',
            cls: 'imitateBrowse',
            flex: 1
        }, {
            xtype: 'button',
            ui: 'cef',
            iconCls: 'i-im-min',
            handler: 'cefMin'
        }, {
            xtype: 'button',
            ui: 'cef',
            iconCls: 'i-im-maxmin',
            handler: 'cefMax'
        }, {
            xtype: 'button',
            ui: 'cefClose',
            iconCls: 'i-im-close',
            handler: 'cefClose'
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
    }],


    cefClose() {
        if(window.cefMain) {
            window.cefMain.close();
        }
    },

    cefMax() {
        if(window.cefMain) {
            window.cefMain.max();
        }
    },

    cefMin() {
        if(window.cefMain) {
            window.cefMain.min();
        }
    }
});