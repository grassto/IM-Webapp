Ext.define('IMMobile.store.RecentChatList', {
    extend: 'Ext.data.Store',

    alias: 'store.RecentChatList',

    requires: [
        'IMMobile.model.RecentChatList'
    ],

    model: 'IMMobile.model.RecentChatList',

    sorters: [{
        property: 'is_top',
        direction: 'DESC'
    }, { // 按时间降序排序
        property: 'last_post_at',
        direction: 'DESC'
    }],

    // proxy: {
    //     type: 'ajax',
    //     url: Config.httpUrlForGo + 'users/me/chats',
    //     api: {
    //         read: Config.httpUrlForGo + 'users/me/chats'
    //     }
    // }
});