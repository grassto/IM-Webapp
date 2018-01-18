Ext.define(null, { //'MX.override.grid.plugin.PagingToolbar'
    override: 'Ext.grid.plugin.PagingToolbar',

    /**
     * 取消 slider field 拖拽时实时更改值
     *
     * @param {Ext.field.SingleSlider} field
     * @param {Ext.slider.Slider} slider
     * @param {Number} value
     */
    onPageSliderDrag(field, slider, value) {
        this.isDragging = true;
    },

    /**
     * 销毁时销毁分页工具栏
     */
    destroy() {
        var toolbar = this.getToolbar();
        this.callParent(arguments);
        Ext.destroy(toolbar);
    }
});