Ext.define('IM.view.rightContainer.BlankPage', {
    extend: 'Ext.panel.Panel',
    xtype: 'pageblank',

    requires: [
        'Ext.layout.VBox'
    ],

    layout: {
        type: 'vbox',
        pack: 'center',
        align: 'center'
    },

    items: [{
        cls: 'blank-page-container',
        html: '<div class=\'fa-outer-class\'><span class=\'x-fa fa-clock-o\'></span></div>' +
            '<h1>未选择聊天!</h1><span class=\'blank-page-text\'></span>'
    }]
});