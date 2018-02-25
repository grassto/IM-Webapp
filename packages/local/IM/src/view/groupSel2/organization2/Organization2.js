Ext.define('IM.view.groupSel2.organization2.Organization2', {
    extend: 'Ext.grid.Tree',
    xtype: 'groupSel-organization2',

    requires: [
        'IM.store.IMOrg',
        'IM.view.groupSel2.organization2.Organization2Controller'
    ],

    controller: 'organization2controller',

    store: {
        type: 'IMOrg'
    },

    height: 300,
    width: 300,
    // layout: 'fit',
    hideHeaders: true,

    columns: [{
        xtype: 'treecolumn',

        renderer: function(value, record) {
            return '<div style="line-height:38px;">' +
                        '<a class="avatar link-avatar firstletter " letter="' + AvatarMgr.getFirstLetter(record.data.name) + '" style="float:left;' + AvatarMgr.getColorStyle(record.data.name) + '" ></a>' +
                        value +
                    '</div>';
        },

        dataIndex: 'name',
        flex: 1
    }, {
        xtype: 'checkcolumn',
        headerCheckbox: true,
        dataIndex: 'isSel',
        listeners: {
            checkchange: 'onCheckchange'
        }
    }]

});