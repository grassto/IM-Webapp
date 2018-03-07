Ext.define('IM.view.groupSel2.GroupSel2', {
    extend: 'Ext.Dialog',
    xtype: 'groupSel2',

    requires: [
        'IM.model.GrpSelMem',
    ],

    userCls: 'IM_groupSel2',
    title: '发起群聊',
    closable: true,
    closeAction: 'hide',
    resizable: true,
    layout: 'fit',

    defaultListenerScope: true, // this 作为事件处理函数的 scope

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
            cls: 'IM_grpSel2',
            items: [{
                layout: 'vbox',
                cls: 'IM_grpSel2_left',
                // minWidth: 300,
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
                xtype: 'panel',
                minWidth: 300,
                maxHeigth: 500,
                layout: 'vbox',
                style: {
                    paddingLeft: '10px'
                },
                items: [/* {
                        xtype: 'component',
                        bind: {
                            html: '{listText}'
                        },
                        height: 20
                    }, */{
                        xtype: 'list',
                        itemId: 'grpSelList2',
                        flex: 1,
                        store: {
                            model: 'IM.model.GrpSelMem'
                        },
                        itemTpl: '<div style="line-height:38px;">' +
                            '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]}" style="float:left;{[AvatarMgr.getColorStyle(values.name)]}" ></a>' +
                            '{name}' +
                            '</div>',
                        onItemDisclosure: 'onDisclosureTap'
                    }]

            }]
        }];

        this.callParent([
            config
        ]);
    },

    initialize() {
        var grp = this.down('#grpSel-org2');
        BindHelper.loadOrganization(grp);
    },

    onDisclosureTap() {
        alert(123)
    }
});