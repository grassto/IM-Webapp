Ext.define('IM.view.groupSel.organization.Organization', {
    extend: 'Ext.grid.Tree',
    xtype: 'groupSel-organization',

    userCls: 'IM-grp-org',

    requires: [
        'IM.store.IMOrg'
    ],

    store: {
        type: 'IMOrg'
    },

    defaultListenerScope: true, // 作用域为当前

    height: 300,
    width: 350,
    hideHeaders: true,
    expanded: true,

    columns: [{
        xtype: 'treecolumn',

        renderer: function (value, record) {
            // debugger;
            return '<div style="line-height:38px;">' +
                '<a class="avatar link-avatar firstletter " letter="' + AvatarMgr.getFirstLetter(record.data.name) + '" style="float:left;' + AvatarMgr.getColorStyle(record.data.name) + '" ></a>' +
                value +
                '</div>';
        },

        dataIndex: 'name',
        flex: 1
    }, {
        xtype: 'checkcolumn',
        headerCheckbox: true,
        dataIndex: 'isSel',
        width: 15,
        listeners: {
            checkchange: 'onCheckchange',
            beforecheckchange: 'onBeforecheckchange'
        }
    }],

    // CheckBox更改之前触发，判断其状态是否可以更改
    onBeforecheckchange(view, rowIndex, checked, record) {
        if (record.data.leaf) {
            for (var i = 0; i < User.crtChatMembers.length; i++) {
                if (record.data.id == User.crtChatMembers[i]) {
                    return false;
                }
            }
        }
    },

    onCheckchange(view, rowIndex, checked, record) {
        var me = this,
            list = view.up('groupSel').down('#grpSelMem'),
            listStore = list.getStore();
        me.fireMemToList(listStore, checked, record);
    },

    fireMemToList(listStore, checked, record) {
        var me = this,
            data = record.data;
        if (data.leaf) { // 选中的是子节点
            if (!GroupSelHelper.isDefaultSel(data)) { // 默认的就不管了，不是默认的则在此规则中
                if (checked) { // 选中
                    record.set('isSel', true); // 左侧树，选中
                    // 若为默认选中的用户，则右侧不展示
                    listStore.insert(0, data);
                }
                else { // 取消选中
                    record.set('isSel', false);// 左侧树，设置未选中
                    listStore.remove(record);
                }
            }
        }
        else { // 选中的是父节点，则递归选中子节点
            if (record.childNodes.length > 0) {
                for (var i = 0; i < record.childNodes.length; i++) {
                    // record.childNodes[i].set('isSel', true);
                    me.fireMemToList(listStore, checked, record.childNodes[i]);
                }
            }
        }
    }
});