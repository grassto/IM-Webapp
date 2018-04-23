Ext.define('IMCommon.model.PersonList', {
    extend: 'Ext.data.Model',

    idProperty: 'user_id',
    fields: ['user_id', 'user_name', {
        name: 'selList',
        type: 'bool',
        defaultValue: false
    }]
});