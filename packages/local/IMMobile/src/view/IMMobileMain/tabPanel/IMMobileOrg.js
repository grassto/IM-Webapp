Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileOrg', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-Org',

    requires: [
        'Ext.dataview.NestedList',
        'IMMobile.view.chatDetail.memDetail'
    ],

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

    initialize() {
        const me = this;
        me.down('#OrgNestedList').on({
            leafitemtap: 'onLeafItemTap',
            scope: me
        });
    },

    /**
     * 叶节点的点击事件，只负责跳转
     */
    onLeafItemTap(nestedlist, list, index, target, record) {
        User.crtSelMemId = record.data.user_id;

        const imMobile = Ext.Viewport.lookup('IMMobile');

        imMobile.push({
            xtype: 'IMMobile-memDetail',
            itemId: 'IMMobile-memDetail'
        });
    },

    getOrgRoot() {
        const me = this;

        var result = '';
        Utils.ajaxByZY('GET', 'users/all', {
            async: false,
            success: function (data) {
                User.allUsers = data.users;
                result = me.imitateOrgData(data.users, data.organizations);

                for (let i = 0; i < data.users.length; i++) {
                    if (data.users[i].user_id !== User.ownerID) {
                        User.allOthers.push(data.users[i]); // 记录所有其他成员信息，用来匹配频道的展示名
                    }
                }
            }
        });

        return result;
    },

    imitateOrgData(users, orgs) {
        // 先把人给加到组织上，然后再搞组织
        for (var i = 0; i < orgs.length; i++) {
            for (var j = 0; j < users.length; j++) {
                if (users[j].org_ids == orgs[i].org_id) {
                    users[j].text = users[j].user_name;
                    users[j].leaf = true;

                    if (!orgs[i].items) {
                        orgs[i].items = [];
                    }

                    orgs[i].items.push(users[j]);
                }
            }
        }

        // 解决根节点不展示的问题
        var item = [];
        for (var i = 0; i < orgs.length; i++) {
            if (orgs[i].parent_id === '') {// 根节点
                orgs[i].text = orgs[i].org_name;
                item.items = [];
                item.items.push(orgs[i]);
                // item = orgs[i];
                orgs.splice(i, 1); // 从数组里删除

                break;
            }
        }

        this.createItems(item.items[0], orgs);

        return item;
    },

    createItems(parentItem, orgs) {
        const me = this;
        // var pItem;
        for (var i = 0; i < orgs.length; i++) {
            if (parentItem.org_id == orgs[i].parent_id) {
                orgs[i].text = orgs[i].org_name;

                if (!parentItem.items) {
                    parentItem.items = [];
                }
                parentItem.items.push(orgs[i]);

                // 这样删数组中的东西不一定好
                // pItem = orgs[i];
                // orgs.splice(i, 1);

                me.createItems(orgs[i], orgs);
            }
        }
    }
});