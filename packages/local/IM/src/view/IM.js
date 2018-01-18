Ext.define('IM.view.IM', {
    extend: 'Ext.Container',
    xtype: 'IM',
    reference: 'IM',

    controller: 'IM',

    requires: [
        'IM.view.IMController',
        'IM.view.chat.ChatView',
        'IM.view.chat.ChatInput',
        'IM.view.msgManager.MsgManager',
        'IM.view.leftTab.organization.Organization',
        'IM.view.leftTab.recentChat.RecentChat'
    ],
    layout: 'hbox',
    viewModel: {
        data: {
            ownerName: '张龙',
            ownerMail: 'zhanglong@163.com',
            sendToName: '赵虎',
            avatar: '',
            status: ''
        }
    },
    
    config: {
        /**
         * @cfg {Boolean} enableUpload
         * 允许添加并上传文件
         */
        enableUpload: true
    },

    initialize() {
        this.on({
            painted: 'onPainted',
            scope: this
        });
    },
    onPainted() {
        var me = this;
        Ext.get('addMem').on('click', function () {
            me.getController().onShowGrpSel();
        });
    },

    items: [{// 左边
        xtype: 'panel',
        resizable: {
            edges: 'east'
        },
        // flex: 0.3,
        layout: 'vbox',
        minWidth: 200,
        cls: 'left_panel',
        ui: 'tab',

        items: [{ // 个人信息
            xtype: 'button',
            itemId: 'btnMe',
            textAlign: 'left',
            reference: 'left_title',
            userCls: 'mine-avatar',
            bind: {
                text: '{avatar}' +
                    '<div>{ownerName}</div>' +
                    '<div>{ownerMail}</div>'
            },
            menu: [{
                text: '设置',
                iconCls: 'x-fa fa-wrench'
            }, {
                text: '注销',
                handler: 'onLogout',
                iconCls: 'x-fa fa-times-rectangle-o'
            }]
        }, {
            xtype: 'panel',
            layout: 'hbox',
            items: [{
                xtype: 'formpanel', // 搜索框
                reference: 'searchForm',
                flex: 1,
                items: [
                    {
                        xtype: 'fieldset',
                        items: [
                            {
                                xtype: 'searchfield',
                                placeholder: '搜索',
                                name: 'query',
                                ui: 'alt'
                            }
                        ]
                    }
                ]
            }, {
                xtype: 'button',
                iconCls: 'x-fa fa-plus',
                handler: 'onShowGrpSel'
            }]
        }, {
            // tabPanel
            xtype: 'tabpanel',
            flex: 1,
            ui: 'tab',
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
                itemId: 'organization'
            }, {
                // 设置
                iconCls: 'x-fa fa-cog',
                cls: 'left_tab'
            }]
        }, {
            xtype: 'panel',
            userCls: 'left_bar',
            bbar: [{
                iconCls: 'x-fa fa-clock-o',
                handler: 'onShowMsgManger'
            }, {
                iconCls: 'x-fa fa-star',
                handler: 'onShowFav'
            }, {
                iconCls: 'x-fa fa-list',
                docked: 'right',
                menu: {
                    items: [{
                        text: '设置'
                    }, {
                        text: '关于'
                    }]
                }
            }]
        }]
    },

    // 右边，聊天区
    {
        flex: 1,
        layout: 'vbox',
        cls: 'right_panel',

        items: [
            // 头
            {
                xtype: 'component',
                bind: {
                    html: `<div style="line-height:40px;border-bottom:1px solid #d6d6d6; text-align:center;">
                                    <span class="right-title">{sendToName}</span>
                                    <span id="addMem" class="addMem"></span>
                            </div>`
                }
            },
            // 内容显示区
            {
                // xtype: 'dataview',
                xtype: 'chatView',
                itemId: 'chatView',
                flex: 1,
                style: {
                    borderBottom: '1px solid #d6d6d6'
                }
            },
            // 聊天输入区
            {
                xtype: 'panel',
                resizable: {
                    edges: 'n'
                },
                minHeight: 170,
                layout: 'vbox',
                items: [
                    {
                        xtype: 'chatInput',
                        userCls: 'editor-Ct',
                        flex: 1
                    },
                    {
                        xtype: 'container',
                        items: [{
                            docked: 'right',
                            xtype: 'button',
                            text: '发送',
                            width: 50,
                            height: 28,
                            handler: 'onSend'
                        }]
                    }
                ]
            }
        ]
    }],

    grpSel: { // 新建多人会话
        xtype: 'groupSel'
    },

    fav: { // 收藏
        xtype: 'favorite'
    },

    msgMgr: { // 消息管理器
        xtype: 'msgManager'
    }
});