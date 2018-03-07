Ext.define('IM.view.IM', {
    extend: 'Ext.Container',
    xtype: 'IM',
    reference: 'IM',

    controller: 'IM',

    requires: [
        'IM.view.IMController',
        'IM.view.leftTab.organization.Organization',
        'IM.view.leftTab.recentChat.RecentChat',
        'IM.model.viewModel.IMMainBind',
        'Ext.form.FieldSet',
        'Ext.field.Search',
        'Ext.tab.Panel',
        'Ext.panel.Resizer',
        'IM.view.leftTool.leftTool'
    ],

    uses: [
        'IM.view.rightContainer.IMMainView',
        'IM.view.rightContainer.Details',
        'IM.view.rightContainer.BlankPage',
        'IM.view.msgManager.MsgManager',
        'IM.view.groupSel.GroupSel',
        'IM.view.favorite.Favorite',
        'IM.view.groupSel2.GroupSel2',
        'IM.view.leftTab.setting.setting'
    ],


    layout: 'hbox',
    viewModel: {
        type: 'mainBind'
    },


    // initialize() {
    //     this.on({
    //         painted: 'onPainted',
    //         scope: this
    //     });
    // },
    // onPainted() {
    //     // var me = this;
    //     // Ext.get('addMem').on('click', function () {
    //     //     me.getController().onShowGrpSel();
    //     // });
    // },

    items: [{
        xtype: 'leftTool'
    }, {// 中部
        xtype: 'panel',
        itemId: 'middleView',
        resizable: {
            edges: 'east'
        },
        layout: 'vbox',
        minWidth: 200,
        cls: 'left_panel',
        ui: 'tab',

        items: [/* { // 个人信息
            xtype: 'button',
            itemId: 'btnMe',
            textAlign: 'left',
            reference: 'left_title',
            userCls: 'mine-avatar',
            bind: {
                text: '{avatar}' +
                    '<div>{ownerName}</div>' +
                    '<div>{ownerMail}</div>'
            }
        },*/ {
                xtype: 'panel',
                layout: 'hbox',
                items: [{
                    xtype: 'formpanel', // 搜索框
                    reference: 'searchForm',
                    flex: 1,
                    items: [{
                        xtype: 'fieldset',
                        items: [{
                            xtype: 'searchfield',
                            placeholder: '搜索',
                            name: 'query',
                            // ui: 'alt'
                        }]
                    }]
                }, {
                    xtype: 'button',
                    iconCls: 'x-fa fa-plus',
                    handler: 'showGrpSel'
                }]
            }, {
                xtype: 'recentChat',
                itemId: 'recentChat',
                cls: 'left_tab',
                flex: 1
            }, {
                xtype: 'left-organization',
                cls: 'left_tab',
                itemId: 'left-organization',
                hidden: true,
                flex: 1
            }/* , {
            // tabPanel
            xtype: 'tabpanel',
            flex: 1,
            ui: 'tab',
            tabBar: {
                layout: {
                    pack: 'center'
                },
                docked: 'top'
            },
            listeners: {
                activeItemchange: 'onTabChanges'
            },
            items: [{
                // 最近会话
                iconCls: 'x-fa fa-comment',
                cls: 'left_tab',
                xtype: 'recentChat',
                itemId: 'left_members'
            }, {
                // 人员列表
                iconCls: 'x-fa fa-user',
                xtype: 'left-organization',
                cls: 'left_tab',
                itemId: 'left-organization'
            }, {
                // 设置
                iconCls: 'x-fa fa-th-large',
                cls: 'left_tab'
            }]
        }, {
            xtype: 'panel',
            cls: 'left_bar',
            bbar: [{
                iconCls: 'x-fa fa-clock-o',
                handler: 'onShowMsgManger'
            }, {
                iconCls: 'x-fa fa-star',
                handler: 'onShowFav'
            }, {
                iconCls: 'x-fa fa-list',
                docked: 'right',
                menu: [{
                    text: '设置',
                    // iconCls: 'x-fa fa-wrench'
                }, {
                    text: '注销',
                    handler: 'onLogout',
                    // iconCls: 'x-fa fa-times-rectangle-o'
                }, {
                    text: '关于'
                }]
            }]
        }*/]
    },

    // 右边，聊天区
    /* {
        flex: 1,
        xtype: 'panel'
    }*/],

    grpSel: { // 新建多人会话
        xtype: 'groupSel'
    },
    grpSel2: {
        xtype: 'groupSel2'
    },

    fav: { // 收藏
        xtype: 'favorite'
    },

    msgMgr: { // 消息管理器
        xtype: 'msgManager'
    }
});