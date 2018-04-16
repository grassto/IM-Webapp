Ext.define('IMMobile.view.group.GroupSelList', {
    extend: 'Ext.Panel',
    xytpe: 'IMMobile-grpSelList',

    items: [{
        xtype: 'list',
        itemId: 'grpList',
        grouped: true,
    }]
});