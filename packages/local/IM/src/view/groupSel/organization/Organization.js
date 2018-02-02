Ext.define('IM.view.groupSel.organization.Organization', {
    extend: 'Ext.grid.Tree',
    xtype: 'groupSel-organization',

    userCls: 'IM-grp-org',

    requires: [
        'IM.model.Organization'
    ],

    viewModel: {
        type: 'organization'
    },

    bind: {
        store: '{navItems}'
    },
    // height: 'auto',
    height: 300,
    width: 300,
    // layout: 'fit',
    hideHeaders: true,

    columns: [{
        xtype: 'treecolumn',

        renderer: function(value, record) {
            // debugger;
            return '<div style="line-height:38px;">' +
                        '<a class="avatar link-avatar firstletter " letter="' + AvatarMgr.getFirstLetter(record.data.name) + '" style="float:left;' + AvatarMgr.getColorStyle(record.data.name) + '" ></a>' +
                        value +
                    '</div>';
        },

        dataIndex: 'name',
        flex: 1,
        cell: {
            tools: {
                plus: {
                    zone: 'end',
                    handler: 'onAddMem'
                }
            }
        }
    }/* , {
        xtype: 'checkcolumn',
        headerCheckbox: true,
        text: 'check?',
        width: 100,
        dataIndex: 'check'
    }*/],

});