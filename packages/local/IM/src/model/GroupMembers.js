Ext.define('IM.model.GroupMembers', {
    extend: 'Ext.data.Model',

    idProperty: 'id',
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
                    case 1:
                        return 'red'; // 不在线，红色
                    default:
                        return 'red';
                }
            }
        }
    ]
});