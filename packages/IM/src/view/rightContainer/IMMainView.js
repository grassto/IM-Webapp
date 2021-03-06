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
    items: [{
        xtype: 'container',
        layout: 'hbox',
        bind: {
            hidden: '{isHideBrowseTitle}'
        },
        height: 25,
        items: [{
            xtype: 'component',
            cls: 'imitateBrowse',
            flex: 1,
            plugins: 'draggablehandle'
        }, {
            xtype: 'button',
            ui: 'cef',
            iconCls: 'i-im-min',
            handler: 'cefMin'
        }, {
            xtype: 'button',
            ui: 'cef',
            iconCls: 'i-im-maxmin',
            handler: 'cefMax'
        }, {
            xtype: 'button',
            ui: 'cefClose',
            iconCls: 'i-im-close',
            handler: 'cefClose'
        }]
    }, {
        xtype: 'container',
        flex: 1,
        layout: 'vbox',
        cls: 'right_panel',

        items: [
            // 头
            {
                xtype: 'container',
                layout: 'hbox',
                userCls: 'right-title',
                items: [{
                        xtype: 'textfield',
                        width: '100%',
                        itemId: 'btnEdit',
                        userCls: 'rightTitle',
                        bind: {
                            value: '{sendToName}'
                        },
                        listeners: {
                            blur: 'onTextBlur'
                        }
                }, /* {
                        xtype: 'component',
                        flex: 1,
                        cls: 'imitateLeftTitle'
                    },*/ {
                        xtype: 'button',
                        docked: 'right',
                        iconCls: 'addMem',
                        // iconCls: 'i-im-addmem',
                        // height: 50,
                        // width: 50,
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
                            minHeight: 120,
                            layout: 'vbox',
                            items: [
                                {
                                    xtype: 'chatInput',
                                    itemId: 'chatInput',
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
                                        handler: 'onBtnSend'
                                    }]
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'list',
                    itemId: 'groupList',
                    store: {
                        model: 'IM.model.GroupMembers'
                    },
                    itemTpl: '<div style="cursor:default;" userID="{user_id}">{user_name}<span style="margin-right:5px;background:{status};display:block;width:10px;height:10px;float:left;border-radius:50%;"></span></div>',
                    minWidth: 100,
                    style: {
                        borderLeft: 'solid 1px #cfcfcf'
                    },
                    hidden: true
                }
                ]
            }
        ]
    }]

});