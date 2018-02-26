Ext.define('IM.view.leftTool.leftTool', {
    extend: 'Ext.Panel',
    xtype: 'leftTool',

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
        listeners: {
            activeItemchange: 'onTabChanges'
        },
        tabBar: {
            // cls: 'light-shadow',
            defaultTabUI: 'leftTool-ui',
            layout: {
                pack: 'center'
            },
            docked: 'left'
        },
        items:[
            {
                iconCls: 'x-fa fa-comment',
                badgeText: '3'
            }, {
                iconCls: 'x-fa fa-user'
            }, {
                iconCls: 'x-fa fa-th-large'
            }
        ]
    }/* , {
        flex: 1
    }*/, {
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
            text: '关于'
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
    }]
});