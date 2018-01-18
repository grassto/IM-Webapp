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

    // viewModel: {
    //     data: {
    //         company: 'PushSoft',
    //         org: '技术部'
    //     }
    // },

    userCls: 'details',

    items: [{
        // 可以使用父容器的viewModel
        bind: {
            html: '{orgHtml}'
        }
    }, {
        xtype: 'button',
        bind: {
            text: '{btnText}'
        },
        ui: 'action',
        userCls: 'detailBtn',
        handler: 'onChgToIM',
        width: '300px'
    }]
});