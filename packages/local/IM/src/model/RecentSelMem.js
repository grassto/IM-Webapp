Ext.define('IM.model.RecentSelMem', {
    extend: 'Ext.data.Model',
    idProperty: 'id', // 组织结构
    fields: [
        'id',
        'chat_name',
        'notify',
        'userID',
        'type',
        'isUnRead',
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
            type: 'string' // 这个可以用css样式来替代
            // convert: function (value, record) {
            //     if (value) {
            //         if (value.length > 8) {
            //             return value.substr(0, 8) + '...';
            //         }
            //     }

            //     return value;
            // }
        },
        { // 用于排序
            name: 'last_post_at',
            type: 'date'
        },
        {
            name: 'unReadNum',
            type: 'int'
        },
        {
            name: 'toTop',
            type: 'int'
        }
    ]
});