Ext.define('IMCommon.model.ChatOld', {
    extend: 'Ext.data.Model',
    idProperty: 'chat_id', // 组织结构
    fields: [
        'chat_id',
        'chat_name',
        'notify',
        'user_id',
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
            // type: 'date',
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
        {
            name: 'toTop',
            type: 'int',
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