Ext.define('IM.view.groupSel2.organization2.Organization2Controller', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.organization2controller',
    /**
     * Called when the view is created
     */
    init: function () { },

    onCheckchange(view, rowIndex, checked, record, e, eOpts) {
        var me = this,
        list = view.up('groupSel2').down('#grpSelList2'),
        listStore = list.getStore();
        me.fireMemToList(listStore, checked, record);

    },

    fireMemToList(listStore, checked, record) {
        var me = this,
        data = record.data;
        if (data.leaf) { // 选中的是子节点
            if (checked) { // 选中
                record.set('isSel', true); // 左侧树，选中
                listStore.insert(0, data);
            }
            else { // 取消选中
                record.set('isSel', false);// 左侧树，设置未选中
                listStore.remove(record);
            }
        }
        else { // 选中父节点
            if(record.childNodes.length > 0) {
                for (var i = 0; i < record.childNodes.length; i++) {
                    me.fireMemToList(listStore, checked, record.childNodes[i]);
                }
            }
        }
    }
});