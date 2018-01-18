/**
 * 展示 datetime 的单元格
 * @author jiangwei
 */
Ext.define('MX.grid.cell.DateTime', {
    extend: 'Ext.grid.cell.Date',
    xtype: 'datetimecell',
    applyFormat: function(format) {
        return format || `${Ext.Date.defaultFormat} ${Ext.Date.defaultTimeFormat}`;
    }
});