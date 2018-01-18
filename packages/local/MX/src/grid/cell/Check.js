/**
 * 被 {@link MX.grid.column.Check} 使用的 cell
 * @author jiangwei
 */
Ext.define('MX.grid.cell.Check', {
    extend: 'Ext.grid.cell.Check',
    xtype: 'mx_checkcell',

    valueChecked: null,
    valueUnChecked: null,

    applyValue(value) {
        return value === this.valueChecked;
    },

    updateColumn(column, oldColumn) {
        this.callParent([column, oldColumn]);

        if (column) {
            this.valueChecked = column.valueChecked;
            this.valueUnChecked = column.valueUnChecked;
        }
    },

    onTap(e) {
        const me = this,
            column = me.getColumn();

        if (column.getEditable()) {
            me.callParent(arguments);
        }
    }
});