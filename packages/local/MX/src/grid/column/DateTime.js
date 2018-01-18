/**
 * 展示 datetime 的列
 * @author jiangwei
 */
Ext.define('MX.grid.column.DateTime', {
    extend: 'Ext.grid.column.Date',
    requires: [
        'MX.grid.cell.DateTime'
    ],
    xtype: 'datetimecolumn',
    isDateColumn: true,
    config: {

        /*defaultEditor: {
            xtype: 'datepickerfield'
        },*/
        cell: {
            xtype: 'datetimecell'
        }
    }
});