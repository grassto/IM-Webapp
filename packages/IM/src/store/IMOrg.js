Ext.define('IM.store.IMOrg', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.IMOrg',

    rootVisible: false,

    // 字段之后再改
    fields: [
        'id', 'name', 'def_role_name',
        {
            name: 'iconCls',
            defaultValue: 'hide-icon'
        },
        {
            name: 'isSel',
            type: 'bool'
        }
    ],
    sorters: [{
        property: 'leaf',
        direction: 'DESC'
    }, {
        property: 'id',
        direction: 'ASC'
    }]

});