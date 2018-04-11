Ext.define('IM.view.rightContainer.Details', {
    extend: 'Ext.Container',
    xtype: 'details',

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
            // docked: 'right',
            iconCls: 'i-im-min',
            handler: 'cefMin'
        }, {
            xtype: 'button',
            ui: 'cef',
            // docked: 'right',
            iconCls: 'i-im-maxmin',
            handler: 'cefMax'
        }, {
            xtype: 'button',
            ui: 'cefClose',
            // docked: 'right',
            iconCls: 'i-im-close',
            handler: 'cefClose'
        }]
    }, {
        xtype: 'container',
        flex: 1,
        layout: {
            type: 'vbox',
            pack: 'center',
            align: 'center'
        },

        userCls: 'details',

        items: [{
            // 可以使用父容器的viewModel
            bind: {
                html: '{detailHtml}'
            }
        }, {
            xtype: 'button',
            bind: {
                text: '{btnText}'
            },
            ui: 'action',
            userCls: 'detailBtn',
            handler: 'btnOnChgToIM',
            width: '300px'
        }]
    }],


    btnOnChgToIM() {
        ChatHelper.doubleToIMView();
    },

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