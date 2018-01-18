/**
 * 支持设置 valueChecked 和 valueUnChecked 的 checkcolumn
 * @author jiangwei
 */
Ext.define('MX.grid.column.Check', {
    extend: 'Ext.grid.column.Check',

    isCheckColumn: false,

    requires: [
        'MX.grid.cell.Check'
    ],

    xtype: 'mx_checkcolumn',

    valueChecked: 'Y',

    valueUnChecked: 'N',

    /**
     * @cfg cell
     * @inheritdoc
     */
    cell: {
        xtype: 'mx_checkcell'
    },

    doSetRecordChecked(record, checked) {
        const dataIndex = this.getDataIndex();

        // Only proceed if we NEED to change
        const v = checked ? this.valueChecked : this.valueUnChecked;
        if (record.get(dataIndex) !== v) {
            record.set(dataIndex, v);
        }
    },

    isRecordChecked(record) {
        return record.get(this.getDataIndex()) === this.valueChecked;
    },

    onColumnTap(e) {
        const me = this;

        if (me.getEditable()) {
            me.callParent(arguments);
        }
    }
});