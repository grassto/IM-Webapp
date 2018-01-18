Ext.define('IM.view.groupSel.GroupSelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.groupSel',


    onSearch() {

    },

    init() {
        // debugger;
        var grp = this.getView().down('#grpSelMem');
        grp.getStore().add({
            id: '1',
            name: 'zzyy'
        });
    },

    onAddMem(grid, info) {
        var me = this,
            list = me.getView().down('#grpSelMem'),
            data = info.record.data;
        me.addMemToList(data, list);
    },

    /**
     * 从树上选择节点添加到右侧list
     * @param {*} data 需要添加的数据信息
     * @param {*} list 目标list
     */
    addMemToList(data, list) {
        var me = this, result = [];
        if (data.leaf) {
            result.push(data);
            list.getStore().add(result);
        } else {
            if (data.children.length > 0) {
                for (var i = 0; i < data.children.length; i++) {
                    me.addMemToList(data.children[i], list);
                }
            }
        }
    },

    onOk() {
        this.getView().hide();
        this.onHide();
    },

    onCancle() {
        this.getView().hide();
        this.onHide();
    },

    onDisclosureTap(value) {
        this.getView().down('#grpSelMem').getStore().remove(value);
    },

    onHide() {
        this.getView().down('#grpSelMem').getStore().removeAll();
    }
});