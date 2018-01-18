Ext.define('IM.model.GrpSelMem', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        'id', 'name'
    ]
    // autoLoad: true,
    // proxy: {
    //     type: 'ajax',
    //     url: '/resources/1.json',

    //     reader: {
    //         type: 'json',
    //         rootProperty: 'data',

    //         // Do not attempt to load orders inline.
    //         // They are loaded through the proxy
    //         implicitIncludes: false
    //     }
    // }
});