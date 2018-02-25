Ext.define('IM.view.groupSel2.GroupSel2', {
    extend: 'Ext.Dialog',
    xtype: 'groupSel2',

    requires: [
        'IM.model.GrpSelMem',
    ],

    initialize() {
        var grp = this.down('#grpSel-org2');
        BindHelper.loadOrganization(grp);
    },

    title: '发起群聊',
    closable: true,
    closeAction: 'hide',
    resizable: true,

    buttonAlign: 'right',
    buttons: [{
        text: '确定',
        ui: 'action'
    }, {
        text: '取消',
        ui: 'flat'
    }],

    constructor(config) {
        config = config || {};
        config.items = [{
            xtype: 'container',
            layout: 'hbox',
            padding: 20,
            items: [{
                layout: 'vbox',
                minWidth: 300,
                items: [{
                    xtype: 'textfield',
                    name: 'Subject',
                    role: 'filter',
                    placeholder: '搜索',
                    minHeight: 30
                }, {
                    xtype: 'groupSel-organization2',
                    itemId: 'grpSel-org2',
                    flex: 1
                }]
            }, {
                xtype: 'list',
                itemId: 'grpSelList2',
                minWidth: 300,
                style: {
                    paddingLeft: '10px'
                },
                store: {
                    model: 'IM.model.GrpSelMem'
                },
                itemTpl: '<div style="line-height:38px;">' +
                    '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]}" style="float:left;{[AvatarMgr.getColorStyle(values.name)]}" ></a>' +
                    '{name}' +
                    '</div>'
            }]
        }];

        this.callParent([
            config
        ]);
    }
});