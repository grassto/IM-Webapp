Ext.define('IM.model.RecentSelMem', {
    extend: 'Ext.data.Model',
    idProperty: 'id', // chat_id
    fields: [
        'id',
        'chat_name',
        'userID',
        'type',
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
        {
            name: 'name',
            type: 'string'
        },
        { // 用于排序
            name: 'last_post_at',
            type: 'date'
        },
        {
            name: 'unReadNum',
            type: 'int',
            defaultValue: 0
        },
        { // 是否置顶
            name: 'toTop',
            type: 'bool'
        },
        'last_post_msg'
    ]
});