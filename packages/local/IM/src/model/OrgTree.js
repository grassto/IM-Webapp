Ext.define('IM.model.OrgTree', {
    extend: 'Ext.data.TreeModel',
    entityName: 'orgTree',
    idProperty: 'id',

    fields: [
        'id', 'name',
        {
            name: 'iconCls',
            defaultValue: 'hide-icon'
        }
    ]
});