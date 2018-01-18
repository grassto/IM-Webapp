/**
 * bug fix: 
 * 1、设置了 selectable: 'multi' 的 List, 取消选中某一行时，deselect 事件没有触发
 * 2、dataview 没有触发 selectionchange
 */
Ext.define(null, { //'MX.override.dataview.selection.Model'
    override: 'Ext.dataview.selection.Model',

    selectWithEventMulti: function (record, e, isSelected) {
        var me = this,
            shift = e.shiftKey,
            ctrl = e.ctrlKey,
            start = shift ? me.selectionStart : null;

        if (shift && start) {
            me.selectRange(start, record, ctrl);
        } else {
            if (isSelected) me.deselect(record);
            else me.select(record, true);
            //me[isSelected ? 'deselect' : 'select'](record, true);
        }
    },

    // bug fix: dataview 没有触发 selectionchange
    fireSelectionChange(records, selected) {
        this.callParent(arguments);

        this.getView().fireEvent('selectionchange', this.getView(), records, selected);
    }
});