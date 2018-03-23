Ext.define('IM.view.rightContainer.IMMainView', {
    extend: 'Ext.Container',
    xtype: 'im-main',
    controller: 'im-right-main',

    requires: [
        'IM.view.rightContainer.IMMainViewController',
        'IM.view.chat.ChatView',
        'IM.view.chat.ChatInput',
        'Ext.panel.Resizer',
        'IM.model.GroupMembers'
    ],

    layout: 'vbox',
    cls: 'right_panel',

    items: [
        // 头
        {
            xtype: 'container',
            layout: 'hbox',
            userCls: 'right-title',
            items: [{
                bind: {
                    html: '<span>{sendToName}</span><span style="display:{showStatus};color:#bfbfbf;margin-left:30px;font-size:small;">{status}</span>'
                }
            }, {
                xtype: 'button',
                itemId: 'btnEdit',
                width: 40,
                iconCls: 'x-fa fa-pencil',
                handler: 'changeChatHeader'
            }, {
                xtype: 'button',
                docked: 'right',
                iconCls: 'addMem',
                handler: 'onShowGrpSel'
            }]
        },
        {
            flex: 1,
            layout: 'hbox',
            items: [{
                xtype: 'panel',
                // resizable: {
                //     edges: 'west'
                // },
                flex: 1,
                layout: 'vbox',
                items: [
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
                    },
                     {

                     }
                ]
            },
            {
                xtype: 'list',
                itemId: 'groupList',
                store: {
                    model: 'IM.model.GroupMembers'
                },
                itemTpl: '<div userID="{user_id}">{user_name}<span style="margin-right:5px;background:{status};display:block;width:10px;height:10px;float:left;border-radius:50%;"></span></div>',
                minWidth: 150,
                style: {
                    borderLeft: 'solid 1px #cfcfcf'
                },
                hidden: true
            }
            ]
        }
    ]
    
    // destroy() {
    //     alert('en');
    // }
});