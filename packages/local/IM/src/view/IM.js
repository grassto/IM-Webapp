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
        'IM.view.leftTool.leftTool',
        'IM.view.middlePanel.MiddlePanel'
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
        xtype: 'midPanel',
        itemId: 'middleView',
        minWidth: 200,
        resizable: {
            edges: 'east'
        }
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