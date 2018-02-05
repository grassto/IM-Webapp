Ext.define('IM.model.RecentSelMem', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        'id', 'notify', 'userID', 'type', 'isUnRead',
        {
            name: 'name',
            type: 'string',
            convert: function(value, record) {
                if(value) {
                    if(value.length > 8) {
                        return value.substr(0, 8) + '...';
                    }
                }
                
                return value;
            }
        },
        { // 用于排序
            name: 'last_post_at',
            type: 'date'
        },
        {
            name: 'unReadNum',
            type: 'int'
        }
    ],

    sorters: ['id']
});