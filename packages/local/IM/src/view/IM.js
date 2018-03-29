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
        'IM.view.leftTab.setting.setting'
    ],


    viewModel: {
        type: 'mainBind'
    },

    layout: 'hbox',

    items: [{ // 左侧工具条
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

        items: [{
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
                        name: 'query'
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
        }]
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