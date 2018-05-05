Ext.define('IMMobile.view.IMMobileMain.MainTabController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.maintabcontroller',

    onTabChanges(tabpanel, tab, oldTab) {
        var me = this;
        if (tab.iconCls == 'x-fa fa-list-alt') {
            if (User.isFirstCon) { // 标志是否是第一次加载
                User.isFirstCon = false;

                // 在此加载create出nestedlist然后加入container
                Utils.ajaxByZY('GET', 'users/all', {
                    success: function (data) {
                        User.allUsers = data.users;

                        var root = me.imitateOrgData(data.users, data.organizations);

                        var store = Ext.create('Ext.data.TreeStore', {
                            defaultRootProperty: 'items',
                            root: root,
                            fields: ['text']
                            // model: 'IMMobile.model.ChatOrg' // 这样写也错
                        });

                        var nestedList = Ext.create('Ext.NestedList', {
                            cls: 'mobileNestList',
                            itemId: 'OrgNestedList',
                            flex: 1,
                            displayField: 'text',

                            useTitleAsBackText: false,
                            updateTitleText: false,
                            emptyText: '加载中...',
                            backText: '返回',

                            store: store,

                            listeners: {
                                leafitemtap: {
                                    fn: function (nestedlist, list, index, target, record) {
                                        var id = record.data.user_id;
                                        if (id !== User.ownerID) {
                                            User.crtSelMemId = record.data.user_id; // 根据user_id来判断是否存在频道

                                            User.crtChatName = record.data.user_name; // chatView标题头修改

                                            Redirect.redirectTo('IMMobile-memDetail');
                                        }
                                    }
                                }
                            }
                        });
                        me.getView().down('IMMobile-Org').add(nestedList);
                    }
                });


            }
        }
    },

    imitateOrgData(users, orgs) {
        const me = this;
        // 先把人给加到组织上，然后再搞组织
        for (var i = 0; i < orgs.length; i++) {
            for (var j = 0; j < users.length; j++) {
                if (users[j].org_ids == orgs[i].org_id) {
                    users[j].text = me.paintUserText(users[j].user_name);
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
                orgs[i].text = me.paintText(orgs[i].org_name);
                item.items = [];
                item.items.push(orgs[i]);
                // item = orgs[i];
                orgs.splice(i, 1); // 从数组里删除

                break;
            }
        }

        me.createItems(item.items[0], orgs);

        return item;
    },

    createItems(parentItem, orgs) {
        const me = this;
        // var pItem;
        for (var i = 0; i < orgs.length; i++) {
            if (parentItem.org_id == orgs[i].parent_id) {
                orgs[i].text = me.paintText(orgs[i].org_name);

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
    },

    // 初始化的时候就将text给做成div，渲染好
    paintUserText(text) {
        return [
            '<div class="nested-org">',
            '<a class="avatar link-avatar firstletter " letter="' + AvatarUtil.getFirstLetter(text) + '" style="float:left;' + AvatarUtil.getColorStyle(text) + '">',
            '</a>',
            text,
            '</div>'
        ].join('');
    },
    paintText(text) {
        return [
            '<div class="nested-org">',
            '<div class="nested-org-avatar"></div>',
            text,
            '</div>'
        ].join('');
    }
});