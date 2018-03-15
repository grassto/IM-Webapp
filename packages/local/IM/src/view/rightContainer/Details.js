Ext.define('IM.view.rightContainer.Details', {
    extend: 'Ext.Container',
    xtype: 'details',

    requires: [
        'Ext.layout.VBox'
    ],

    layout: {
        type: 'vbox',
        pack: 'center',
        align: 'center'
    },

    defaultListenerScope: true,

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
    }],

    btnOnChgToIM() {
        ChatHelper.doubleToIMView();
    }
});