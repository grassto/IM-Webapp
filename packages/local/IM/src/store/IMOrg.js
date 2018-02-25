Ext.define('IM.store.IMOrg', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.IMOrg',

    fields: [
        'id', 'name',
        {
            name: 'iconCls',
            defaultValue: 'hide-icon'
        },
        {
            name: 'isSel',
            type: 'bool'
        }
    ]

});