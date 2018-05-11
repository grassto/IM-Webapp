Ext.define('IM.model.RecentSelMem', {
    extend: 'Ext.data.Model',
    idProperty: 'chat_id', // chat_id
    fields: [
        'chat_id',
        'chat_name',
        'userID',
        'type', // chat_type
        'isUnRead', // 加这个字段是为了当前页面未读，但是不显示未读条数
        {
            name: 'status',
            type: 'int',
            convert: function(value) {
                if(value == 0) {
                    return '在线';
                } else if(value == -1) {
                    return '离线';
                }
                return '';
            }
        },
        { // 会话展示的名称
            name: 'name',
            type: 'string'
        },
        { // 用于排序
            name: 'last_post_at',
            // type: 'date', // 使用date动态去修改record的值，页面无效果
            convert: function(value) {
                if(value == 0 || value == undefined || value == null) {
                    return '';
                }
                return Utils.datetime2Ago(value, true);
            }
        },
        {
            name: 'unReadNum',
            type: 'int',
            defaultValue: 0
        },
        { // 是否置顶
            name: 'toTop',
            type: 'boolean',
            defaultValue: false
        },
        {
            name: 'last_post_name',
            type: 'string'
            // convert: function(value) {
            //     return ChatHelper.getName(value);
            // }
        },
        'last_msg_type',
        'last_post_msg',

        'members'
    ]
});