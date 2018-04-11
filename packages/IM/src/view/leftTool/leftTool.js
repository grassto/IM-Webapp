Ext.define('IM.view.leftTool.leftTool', {
    extend: 'Ext.Panel',
    xtype: 'leftTool',

    layout: 'vbox',
    width: 50,
    items: [{
        xtype: 'container',
        height: 15,
        cls: 'imitateLeftTitle',
        bind: {
            hidden: '{isHideBrowseTitle}'
        }
    }, {
        xtype: 'panel',
        flex: 1,
        layout: 'vbox',
        userCls: 'left_tool',
        maxWidth: 50,
        minWidth: 50,
        items: [{
            cls: 'leftTool-avatar',
            bind: {
                html: '{avatar}'
            }
        }, {
            xtype: 'tabpanel',
            itemId: 'leftTool_tab',
            listeners: {
                activeItemchange: 'onTabChanges'
            },
            tabBar: {
                defaultTabUI: 'leftToolBar-ui',
                layout: {
                    pack: 'center'
                },
                docked: 'left'
            },
            items: [
                {
                    iconCls: 'x-fa fa-comment',
                    itemId: 'leastComment'
                    // badgeText: '3'
                }, {
                    iconCls: 'x-fa fa-user',
                    itemId: 'users'
                }, {
                    iconCls: 'x-fa fa-th-large',
                    itemId: 'settings'
                }
            ]
        }, {
            xtype: 'button',
            ui: 'leftTool-ui',
            iconCls: 'x-fa fa-list',
            docked: 'bottom',
            menu: [{
                text: '设置',
                // iconCls: 'x-fa fa-wrench'
            }, {
                text: '注销',
                handler: 'onLogout',
                // iconCls: 'x-fa fa-times-rectangle-o'
            }, {
                text: '关于',
                // handler: 'onShowAbout'
            }]
        }, {
            xtype: 'button',
            ui: 'leftTool-ui',
            iconCls: 'x-fa fa-clock-o',
            docked: 'bottom',
            handler: 'onShowMsgManger'
        }, {
            xtype: 'button',
            ui: 'leftTool-ui',
            iconCls: 'x-fa fa-star',
            docked: 'bottom',
            handler: 'onShowFav'
        }, {
            xtype: 'button',
            text: '测试',
            docked: 'bottom',
            handler: 'onTest',
            hidden: true
        }]
    }]


});