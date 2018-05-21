/**
 * 一个tabpanel，作为主页面
 */
Ext.define('IMMobile.view.main.MainTabPanel', {
    extend: 'Ext.tab.Panel',
    xtype: 'mainTabPanel',

    requires: [
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChat',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileOrg',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileWorkDesk',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileMe',
        'IMMobile.view.IMMobileMain.MainTabController'
    ],

    controller: 'maintabcontroller',

    defaults: {
        scrollable: true,
        tab: {
            flex: 1
        }
    },

    tabBar: {
        docked: 'bottom',
        userCls: 'bottominset',
        defaults: { // 怎么没效果
            iconAlign: 'top'
        }
    },

    items: [{
        title: '消息',
        iconAlign: 'top',
        iconCls: 'x-fa fa-comment',
        xtype: 'IMMobile-Chat',
        itemId: 'IMMobile_Chat'
    }, {
        title: '通讯录',
        iconAlign: 'top',
        iconCls: 'x-fa fa-list-alt',
        xtype: 'IMMobile-Org',
        itemId: 'IMMobile_Org'
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
    }],

    listeners: {
        activeitemchange: 'onTabChanges'
    }
});