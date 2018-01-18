/**
 * 为 field 的控件 添加一个配置项 bodyWidth
 * 用于设置输入框的宽度，而非包括 label 的总宽度
 */
Ext.define(null, {
    override: 'Ext.field.Field',

    config: {
        bodyWidth: null
    },

    applyBodyWidth(width) {

        if (this.getWidth() !== null) {
            Ext.raise('bodyWidth 和 width 不能同时设置');

            return null;
        }

        return this.filterLengthValue(width);
    },

    updateBodyWidth(width) {
        var me = this;

        me.bodyWrapElement.setWidth(width);
    }
});