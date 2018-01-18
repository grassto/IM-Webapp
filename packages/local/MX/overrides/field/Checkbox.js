/**
 * bug fix: readonly 的 checkbox 还能点
 */
Ext.define(null, {
    override: 'Ext.field.Checkbox',

    updateReadOnly(readOnly) {
        this.setInputAttribute('disabled', readOnly ? true : null);
    }
});