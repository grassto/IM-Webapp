Ext.define('IM.view.leftTab.recentChat.RecentChat', {
    extend: 'Ext.dataview.List',
    xtype: 'recentChat',
    requires: [
        'IM.model.RecentSelMem',
        'IM.view.leftTab.recentChat.RecentChatController'
    ],

    controller: 'recentChat',

    store: {
        model: 'IM.model.RecentSelMem',
        // proxy: {
        //     type: 'ajax',
        //     url: Config.httpUrlForGo + 'users/me/channels'
        // }
    },

    itemTpl: [
        '<div style="line-height:38px;">',
            '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]} " style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
            '</a>',
            '{name}',
        '</div>'
    ].join(''),

    listeners: {
        itemTap: 'onSelRecentMem'
    }
});