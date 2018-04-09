Ext.define('IMMobile.view.IMMobileMain.IMMobileMain', {
    extend: 'Ext.tab.Panel',
    xtype: 'IMMobileMain',

    requires: [
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChat',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileOrg',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileWorkDesk',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileMe'
    ],

    defaults: {
        scrollable: true,
        // layout: 'center'
    },

    tabBar: {
        docked: 'bottom',
        defaults: { // 怎么没效果
            iconAlign: 'top'
        }
    },

    items: [{
        title: '消息',
        iconAlign: 'top',
        iconCls: 'x-fa fa-comment',
        xtype: 'IMMobile-Chat'
    }, {
        title: '通讯录',
        iconAlign: 'top',
        iconCls: 'x-fa fa-list-alt',
        xtype: 'IMMobile-Org'
    }, {
        title: '工作台',
        iconAlign: 'top',
        iconCls: 'x-fa fa-th-large',
        xtype: 'IMMobile-WorkDesk'
    }, {
        title: '我',
        iconAlign: 'top',
        iconCls: 'x-fa fa-user',
        xtype: 'IMMobile-Me'
    }]
});