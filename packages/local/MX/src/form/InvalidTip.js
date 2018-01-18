/**
 * 用于显示表单验证结果的控件
 */
Ext.define('MX.form.InvalidTip', {
    extend: 'Ext.Component',
    xtype: 'invalidtip',

    config: {
        errors: null
    },

    tpl: '<tpl if="errors.length">' +
        '<span class="x-fa fa-exclamation-triangle red"> 表单验证失败</span>' +
        '</tpl>',
    tooltip: {
        align: 'l-r0?',
        ui: 'tooltip invalid',
        allowOver: false,
        anchor: true,
        autoCreate: true,
        autoHide: false,
        padding: 15,
        tpl: '<tpl for="errors">' +
            '<div class="form-customerrors-item"><strong>{name}:</strong> {errors}</div>' +
            '</tpl>'
    },

    updateErrors(errors) {
        errors = errors || [];

        const me = this,
            tooltip = me.getTooltip(),
            data = {
                errors
            };
        tooltip.setData(data);
        me.setData(data);
        if (errors.length) {
            me.show();
            tooltip.show();
        } else {
            tooltip.hide();
            me.hide();
        }
    }
});