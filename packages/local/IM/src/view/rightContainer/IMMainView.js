Ext.define('IM.view.rightContainer.IMMainView', {
    extend: 'Ext.Container',
    xtype: 'im-main',
    controller: 'im-main',

    requires: [
        'IM.view.rightContainer.IMMainViewController',
        'IM.view.chat.ChatView',
        'IM.view.chat.ChatInput'
    ],

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
                        // handler: 'onSend'
                    }]
                }
            ]
        }
    ]
});