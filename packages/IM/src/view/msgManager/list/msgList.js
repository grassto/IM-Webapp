Ext.define('IM.view.msgManager.list.msgList', {
    extend: 'Ext.dataview.List',
    xtype: 'msgList',
    requires: [
        'IM.model.RecentSelMem',
        'IM.view.msgManager.list.msgListController'
    ],

    controller: 'msgListController',

    store: {
        model: 'IM.model.RecentSelMem'
    },

    itemTpl: [
        '<div style="line-height:38px;">',
            '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]} " style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
            '</a>',
            '<a class="RecentUnRead" unRead="{unReadNum}" style="display:{[values.isUnRead?"block":"none"]}"></a>',
            '{name}',
        '</div>'
    ].join(''),

    listeners: {
        childTap: 'msgOnChildTap'
    }
});