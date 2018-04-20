Ext.define('IMMobile.view.group.GroupSelList', {
    extend: 'IMMobile.view.base.Container',
    xtype: 'IMMobile-grpSelList',

    requires: [
        'IMCommon.utils.AvatarUtil',
        'IMMobile.view.widget.Navbar',
        'IMCommon.view.list.GroupedList',
        'IMMobile.view.group.GroupSelListController',
        'IMCommon.model.PersonList',

        'IMMobile.view.base.Container'
    ],

    controller: 'groupsellistcontroller',

    viewModel: {
        data: {
            personNum: 0
        }
    },

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        titleMsg: '选择联系人',
        items: [{
            align: 'right',
            iconCls: 'x-fa fa-search',
            ui: 'action'
        }]
    }, {
        xtype: 'baseBackcolor',
        flex: 1,

        layout: 'vbox',
        items: [{
            docked: 'top',
            xtype: 'button',
            iconCls: 'x-fa fa-list-alt',
            width: '100%',
            text: '企业通讯录',
            // textAlign: 'left',
            handler: 'onShowOrgMems'
        }, {
            xtype: 'groupedList',
            itemId: 'grpSelList',
            flex: 1
        }, {
            xtype: 'baseBackcolor',
            docked: 'bottom',
            scrollable: {
                x: true
            },
            items: [{// 给dataview，用样式来解决
                xtype: 'dataview',
                maxHeight: 40,
                scrollable: {
                    x: true
                },
                itemId: 'grpMems',
                itemTpl: '<a class="avatar link-avatar firstletter " letter="{[AvatarUtil.getFirstLetter(values.user_name)]} " style="float:left;{[AvatarUtil.getColorStyle(values.user_name)]}"></a>',
                store: {
                    model: 'IMCommon.model.PersonList'
                },

                listeners: {
                    childTap: 'onRemoveGrpMem'
                }
                // tpl: [
                //     '<tpl for=".">',
                //     '<a class="avatar link-avatar firstletter " letter="{[AvatarUtil.getFirstLetter(values.user_name)]} " style="float:left;{[AvatarUtil.getColorStyle(values.user_name)]}"></a>',
                //     '</tpl>'
                // ].join('')
            }, {
                xtype: 'button',
                docked: 'right',
                height: 40,
                ui: 'action',
                bind: {
                    text: '确定{personNum?"("+personNum+")":""}',
                    hidden: '{personNum == 0}'
                },
                handler: 'onCreateChat'
            }]
        }]
    }],

    initialize() {
        const me = this;
        me.down('groupedList').on({
            childTap: 'onSelMem',
            scope: me
        });

    },

    onSelMem(view, location) {
        var record = location.record;

        // 选中的是items而不是groups
        if (record) {
            const data = record.data,
                me = this,
                store = me.down('#grpMems').getStore(),
                target = location.event.currentTarget,
                div = Ext.fly(target);

            // 选中了
            if (div.hasCls('selList')) {
                store.add({
                    user_id: data.user_id,
                    user_name: data.user_name
                });
                me.getViewModel().set('personNum', me.getViewModel().get('personNum') + 1);
            } else { // 取消选中
                record = store.getById(data.user_id);
                store.remove(record);
                me.getViewModel().set('personNum', me.getViewModel().get('personNum') - 1);
            }
        }
    }
});