Ext.define('IM.view.widget.TestDataView', {
    extend: 'Ext.DataView',
    xtype: 'testView',

    store: {
        data: [
            { id: 1, a: [{ aid: 1 }, { aid: 2 }, { aid: 3 }] },
            { id: 2 },
            { id: 3 },
        ]
    },

    itemTpl: '<div>第{id}个list</div>' +
        '<ul>' +
        '<tpl for="a">' +
        '<li>{aid}</li>' +
        '</tpl>' +
        '</ul>'

});