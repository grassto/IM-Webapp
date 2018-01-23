Ext.define('IM.model.RecentSelMem', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        'id', 'name', 'notify', 'userID', 'type', 'isUnRead',
        { // 用于排序
            name: 'last_post_at',
            type: 'date'
        }
    ],

    sorters: ['id']
});