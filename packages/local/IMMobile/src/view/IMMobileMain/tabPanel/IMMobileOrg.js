Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileOrg', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-Org',

    requires: [
        // 'Ext.dataview.NestedList',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileOrgController',
        // 'IMMobile.view.widget.Navbar' // 含有返回按钮的头
    ],

    controller: 'IMMobileOrgController',

    constructor(config) {
        // 需要自己拼的
        var root = this.getOrgRoot();
        var store = Ext.create('Ext.data.TreeStore', {
            defaultRootProperty: 'items',
            root: root,
            fields: ['text']
            // model: 'IMMobile.model.ChatOrg' // 这样写也错
        });

        config = Ext.apply({
            layout: 'vbox',

            items: [{
                xtype: 'nestedlist',
                itemId: 'OrgNestedList',
                fullscreen: true,
                displayField: 'text',
                store: store
            }]
        }, config);

        this.callParent([config]);
    },

    getOrgRoot() {
        const me = this;

        var result = '';
        Utils.ajaxByZY('GET', 'users/all', {
            async: false,
            success: function(data) {
                result = me.imitateOrgData(data.users, data.organizations);
            }
        });
        
        return result;
    },

    imitateOrgData(users, orgs) {
        var result = [];
        for(var i = 0; i < orgs.length; i++) {
            if (orgs[i].parent_id === '') {// 根节点
                orgs[i].text = orgs[i].org_name;
                result.push(orgs[i]);
            }
        }
    }
});