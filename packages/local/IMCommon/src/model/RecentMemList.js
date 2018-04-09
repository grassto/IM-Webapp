Ext.define('IMCommon.model.RecentChatList', {
    extend: 'Ext.data.Model',

    idProperty: 'chat_id',
    fields: [
        'chat_id', {
            name: 'create_at',
            type: 'date'
        }, {
            name: 'update_at',
            type: 'date'
        }, {
            name: 'delete_at',
            type: 'date'
        }, {
            name: 'last_post_at',
            type: 'date'
        },
        'chat_name',
        'header',
        'purpose',
        'chat_type',
        'is_manual',
        'creator_id',
        'manager_id',
        'chat_status', {// 未读数量
            name: 'unread_count',
            type: 'int',
            defaultValue: 0
        },
        'total_count',
        'mention_count', {
            name: 'member_delete_at',
            type: 'date'
        },
        'user_id', {
            name: 'last_view_at',
            type: 'date'
        },
        'is_top',
        'is_hidden'
    ]
});