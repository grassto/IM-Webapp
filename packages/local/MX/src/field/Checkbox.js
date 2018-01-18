/**
 * 可以设置 valueChecked 和 valueUnChecked 的Checkbox
 * @author jiangwei
 */
Ext.define('MX.field.Checkbox', {
    extend: 'Ext.field.Checkbox',
    xtype: [
        'mx_checkbox',
        'mx_checkboxfield'
    ],

    isCheckbox: false,

    defaultBindProperty: 'value',

    twoWayBindable: {
        checked: 1,
        value: 1
    },

    publishes: {
        checked: 1,
        value: 1
    },

    valueChecked: 'Y',
    valueUnChecked: 'N',
    config: {
        value: null
    },

    getSubmitValue: Ext.emptyFn,

    updateChecked(checked, oldChecked) {
        var me = this,
            eventName;
        if (!me.$onChange) {
            me.inputElement.dom.checked = checked;
        }
        me.toggleCls(me.checkedCls, checked);

        var value = checked ? me.valueChecked : me.valueUnChecked,
            oldValue = oldChecked ? me.valueChecked : me.valueUnChecked;
        me._value = value;

        if (me.initialized) {
            eventName = checked ? 'check' : 'uncheck';
            me.fireEvent(eventName, me);

            me.fireEvent('change', me, value, oldValue);
        }
    },

    applyValue(value) {
        if (value === this.valueChecked) return value;

        return this.valueUnChecked;
    },

    updateValue(value, oldValue) {
        var me = this,
            checked = value === me.valueChecked;
        me.setChecked(checked);
    },

    getSameGroupFields: Ext.emptyFn,
    getGroupValues: Ext.emptyFn,
    setGroupValues: Ext.emptyFn,
    resetGroupValues: Ext.emptyFn
});