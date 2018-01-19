Ext.define('IM.view.groupSel.GroupSel', {
    extend: 'Ext.Dialog',
    xtype: 'groupSel',

    requires: [
        'IM.view.groupSel.organization.Organization',
        'IM.model.GrpSelMem'
    ],

    controller: 'groupSel',

    userCls: 'IM-groupSel',

    title: '发起群聊',
    closable: true,
    closeAction: 'hide',
    resizable: true,
    height: '90vh',
    maxWidth: '90vw',

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
                // style: {
                //     paddingRight: '10px',
                //     borderRight: '1px solid lightgrey'
                // },
                cls: 'IM-grp-left',
                layout: 'vbox',
                items: [{
                    xtype: 'textfield',
                    name: 'Subject',
                    role: 'filter',
                    placeholder: '搜索',
                    minHeight: 30,
                    // responsiveConfig: {
                    //     'width > 1366': {
                    //         width: 250
                    //     },
                    //     'width <= 1024': {
                    //         width: 150
                    //     }
                    // },
                    // plugins: 'responsive',
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
                    flex: 1
                }/* , {
                    xtype: 'textfield',
                    label: '群名称',
                    style: {
                        textAlign: 'left'
                    }
                }, {
                    xtype: 'textfield',
                    label: '群类型'
                }*/]
            }, {
                xtype: 'list',
                itemId: 'grpSelMem',
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
                    '</div>',
                onItemDisclosure: 'onDisclosureTap'
            }]
        }];

        this.callParent([
            config
        ]);
    },


    listeners: {
        beforehide: 'onBeforeHide'
    }

});