Ext.define('IM.model.Member', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
            'id', 'name', 'notify', 'userID', 'type', 'isUnRead'
        ]
});