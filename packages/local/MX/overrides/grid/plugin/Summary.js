Ext.define(null, {
    override: 'Ext.grid.plugin.Summary',

    /**
     * 销毁时销毁 合计行
     */
    destroy() {
        var row = this._row;
        this.callParent(arguments);
        Ext.destroy(row);
    }
});