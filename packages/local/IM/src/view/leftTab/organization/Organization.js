Ext.define('IM.view.leftTab.organization.Organization', {
    extend: 'Ext.grid.Tree',
    xtype: 'left-organization',

    // requires: [
    //     'IM.model.OrgTree'
    // ],

    userCls: 'IM-org-field',

    // store: {
    //     type: '',
    //     model: 'IM.model.OrgTree'
    // },

    viewModel: {
        type: 'organization'
    },
    bind: {
        store: '{navItems}'
    },

    // bind: {
    //     store: {
    //         type: '{navItems}',
    //         // model: 'IM.model.OrgTree'
    //     }
    // },

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