Ext.define('IMMobile.view.group.GroupSelList', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-grpSelList',

    requires: [
        'IMCommon.utils.AvatarUtil',
        'IMMobile.view.widget.Navbar',
        'IMCommon.view.list.GroupedList'
    ],

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar'
    }, {
        xtype: 'groupedList',
        flex: 1
    }/* {
        xtype: 'grid',
        itemId: 'grpGrid',

        store: {
            // groupField: 'name',
            fields: ['check', 'name'],
            data: [{
                check: true,
                name: '张三'
            }, {
                check: true,
                name: '李四'
            }, {
                check: true,
                name: '赵武'
            }]
        },

        hideHeaders: true,
        // grouped: true,

        columns: [{
            dataIndex: 'check',
            width: '30px',
            xtype: 'checkcolumn'
        }, {
            dataIndex: 'name',
            flex: 1,
            renderer: function(value, record) {
                return '<div style="line-height:38px;">' +
                '<a class="avatar link-avatar firstletter " letter="' + AvatarUtil.getFirstLetter(record.data.name) + '" style="float:left;' + AvatarUtil.getColorStyle(record.data.name) + '" ></a>' +
                value +
                '</div>';
            }
        }]
    }*/]
});