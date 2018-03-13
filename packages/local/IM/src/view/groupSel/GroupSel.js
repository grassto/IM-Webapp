Ext.define('IM.view.groupSel.GroupSel', {
    extend: 'Ext.Dialog',
    xtype: 'groupSel',

    requires: [
        'IM.view.groupSel.organization.Organization',
        'IM.model.GroupMembers',
        'IM.view.groupSel.GroupSelController'
    ],

    controller: 'groupSel',

    userCls: 'IM-groupSel',

    title: '发起群聊',
    closable: true,
    closeAction: 'hide',
    resizable: true,

    layout: 'fit',

    buttonAlign: 'right',
    buttons: [{
        text: '确定',
        ui: 'action',
        handler: 'onOk'
    }, {
        text: '取消',
        ui: 'flat',
        handler: 'onCancle'
    }],

    constructor(config) {
        config = config || {};

        config.items = [{
            xtype: 'container',
            layout: 'hbox',
            padding: 20,
            cls: 'IM-grp',
            items: [{
                xtype: 'panel',
                cls: 'IM-grp-left',
                layout: 'vbox',
                items: [{
                    xtype: 'textfield',
                    name: 'Subject',
                    role: 'filter',
                    placeholder: '搜索',
                    minHeight: 30,
                    triggers: {
                        search: {
                            type: 'search',
                            handler: 'onSearch'
                        }
                    },
                    listeners: {
                        clearicontap: 'onSearch',
                        action: 'onSearch'
                    }
                }, {
                    xtype: 'groupSel-organization',
                    itemId: 'grpSel-org',
                    flex: 1
                }]
            }, {
                xtype: 'panel',
                layout: 'vbox',
                minWidth: 300,
                maxHeigth: 500,
                style: {
                    paddingLeft: '10px'
                },
                items: [{
                    xtype: 'list',
                    itemId: 'grpSelMem',
                    flex: 1,
                    store: {
                        model: 'IM.model.GroupMembers'
                    },
                    itemTpl: '<div style="line-height:38px;">' +
                        '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]}" style="float:left;{[AvatarMgr.getColorStyle(values.name)]}" ></a>' +
                        '{name}' +
                        '</div>',
                    onItemDisclosure: 'onDisclosureTap'
                }/* , {
                    xtype: 'button',
                    itemId: 'btnDelAll',
                    text: '删除所有',
                    textAlign: 'right',
                    hidden: true,
                    ui: 'flat',
                    handler: 'onDelAll'
                }*/ ]

            }]
        }];

        this.callParent([
            config
        ]);
    },


    listeners: {
        beforehide: 'onBeforeHide',
        beforeshow: 'onBeforeShow'
    }

});