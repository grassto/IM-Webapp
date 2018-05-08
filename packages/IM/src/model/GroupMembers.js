Ext.define('IM.model.GroupMembers', {
    extend: 'Ext.data.Model',

    idProperty: 'user_id',
    fields: [
        'id',
        'name',
        'mobile',
        'email',
        {
            name: 'status',
            type: 'int',
            convert: function (val) {
                switch (val) {
                    case 0:
                        return 'blue'; // 在线，蓝色
                    case -1:
                        return 'red'; // 不在线，红色
                    default:
                        return 'red';
                }
            }
        },
        {
            name: 'user_id',
            type: 'string'
        },
        { // 从缓存中遍历所有人员，绑定人员姓名
            name: 'user_name',
            type: 'string',
            // convert: function(v, record) {
            //     // debugger;
            //     return ChatHelper.getName(record.data.user_id);
            // }
        }
    ]
});