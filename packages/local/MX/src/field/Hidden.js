/**
 * 原本的 hiddenfield 继承自 Ext.field.Input，dom 元素一堆，所以做了这个仅一个dom元素的 hiddenfield
 * 可以引用这个js文件，原本的 Ext.field.Hidden 无需引用
 * @author jiangwei
 */
Ext.define('MX.field.Hidden', {
    extend: 'Ext.field.Field',
    xtype: 'mx_hiddenfield',

    config: {
        labelAlign: null,
        labelWrap: null,
        placeholder: null
    },

    element: {
        reference: 'element',
        tag: 'input',
        type: 'hidden'
    },

    getTemplate() {
        this.inputElement = this.element;

        return null;
    },

    // @private
    applyValue(value) {
        value = Ext.isEmpty(value) ? '' : `${value}`;

        return this.callParent([value]);
    },

    // @private
    updateValue(newValue, oldValue) {
        const me = this;
        me.element.dom.value = newValue;
        if (!me.isConfiguring && newValue != oldValue) {
            me.fireEvent('change', me, newValue, oldValue);
        }
    },

    updateFieldAttribute(attribute, newValue) {
        const input = this.element;

        if (!Ext.isEmpty(newValue, true)) {
            input.dom.setAttribute(attribute, newValue);
        } else {
            input.dom.removeAttribute(attribute);
        }
    },
    // @private
    updateName(newName) {
        this.callParent(arguments);
        this.updateFieldAttribute('name', newName);
    },

    updateLabelWidth: Ext.emptyFn,
    updateLabelMinWidth: Ext.emptyFn,
    updateLabel: Ext.emptyFn,
    updateLabelCls: Ext.emptyFn
});