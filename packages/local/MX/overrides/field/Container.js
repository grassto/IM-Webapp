/**
 * 输入框的验证提示信息，取的是 label || placeholder || name
 * 现在支持一个 desc，只要field上写了 desc，那么 label 取不到，就优先 取 desc
 */
Ext.define(null, {
    override: 'Ext.field.Container',

    onFieldErrorChange(field) {
        var me = this,
            errors = me.getErrors(),
            fields = me.getFields(),
            name, fieldErrors, label, messages;
        for (name in errors) {
            field = fields[name];
            fieldErrors = errors[name];
            if (fieldErrors) {
                label = field.getLabel() || field.desc || field.getPlaceholder() || field.getName(); // 加个 field.desc
                fieldErrors = Ext.Array.from(fieldErrors).map(function (error) {
                    return {
                        label: label,
                        error: error
                    };
                });
                if (messages) {
                    messages = messages.concat(fieldErrors);
                } else {
                    messages = fieldErrors;
                }
            }
        }
        me.setError(messages || null);
    }
});