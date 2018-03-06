Ext.define('IM.model.RecentSelMem', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        'id', 'notify', 'userID', 'type', 'isUnRead',
        {
            name: 'name',
            type: 'string',
            convert: function (value, record) {
                if (value) {
                    if (value.length > 8) {
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
        },
        {
            name: 'toTop',
            type: 'int'
        }
    ],

    sorters: [{
        property: 'toTop',
        direction: 'DESC'
    }, { // 先按时间降序排序
        property: 'last_post_at',
        direction: 'DESC'
    }]

    // sorters: [{ // 先按时间降序排序
    //     property: 'last_post_at',
    //     direction: 'DESC'
    // }, { // 后按id升序排
    //     property: 'id',
    //     direction: 'ASC'
    // }]
});