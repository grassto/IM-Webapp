Ext.define('IM.view.leftTab.organization.Organization', {
    extend: 'Ext.grid.Tree',
    xtype: 'left-organization',
    controller: 'left-orgController',

    requires: [
        'IM.view.leftTab.organization.OrganizationController',
        'IM.store.IMOrg'
    ],

    userCls: 'IM-org-field',

    store: {
        type: 'IMOrg'
    },

    // viewModel: {
    //     type: 'organization'
    // },
    // bind: {
    //     store: '{navItems}'
    // },

    listeners: {
        itemTap: 'orgOnSelectMem'
    },

    hideHeaders: true,

    columns: [{
        xtype: 'treecolumn',

        renderer: function (value, record) {
            // debugger;
            return '<div style="line-height:38px;">' +
                '<a class="avatar link-avatar firstletter " letter="' + AvatarMgr.getFirstLetter(record.data.name) + '" style="float:left;' + AvatarMgr.getColorStyle(record.data.name) + '" ></a>' +
                value +
                '</div>';
        },

        dataIndex: 'name',
        flex: 1
    }],

});