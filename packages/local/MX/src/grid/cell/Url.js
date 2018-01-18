/**
 * 显示 url 的 cell
 */
Ext.define('MX.grid.cell.Url', {
    extend: 'Ext.grid.cell.Cell',
    xtype: 'urlcell',

    getTemplate: function() {
        var template = this.callParent();

        template[0].tag = 'a';
        template[0].href = 'javascript:;';

        return template;
    }

});