Ext.define('IM.view.leftTab.organization.Organization', {
    extend: 'Ext.grid.Tree',
    xtype: 'left-organization',

    requires: [
        'IM.view.leftTab.organization.OrganizationController',
        'IM.store.IMOrg'
    ],

    controller: 'left-orgController',

    userCls: 'IM-org-field',

    store: {
        type: 'IMOrg'
    },

    listeners: {
        childTap: 'orgOnSelectMem',
        childdoubletap: 'orgOnDblSelMem'
    },

    titleBar: null,

    hideHeaders: true,

    columns: [{
        xtype: 'treecolumn',

        renderer: function (value, record) {
            if (record.data.leaf) {
                return '<div style="line-height:38px;cursor: default;">' +
                    '<a class="avatar link-avatar firstletter " letter="' + AvatarMgr.getFirstLetter(record.data.name) + '" style="float:left;' + AvatarMgr.getColorStyle(record.data.name) + '" ></a>' +
                    value +
                    '</div>';
            }
            return '<div style="line-height:38px;cursor: default;">' +
                    value +
                    '</div>';
        },

        dataIndex: 'name',
        flex: 1
    }]

});