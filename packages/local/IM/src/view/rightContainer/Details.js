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
        height: 30,
        cls: 'imitateBrowse',
        bind: {
            hidden: '{isShowBrowseTitle}'
        },
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
    }
});