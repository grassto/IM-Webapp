/**
 * 为 fieldmanager 增加 updateReadOnly 方法
 */
Ext.define(null, { //'MX.override.field.Manager'
    override: 'Ext.field.Manager',
    
    updateReadOnly(readOnly){
        this.getFields(false).forEach(function(field) {
            if(!field.isXType('displayfield')) {
                if(field.setReadOnly) field.setReadOnly(readOnly);
                else field.setDisabled(readOnly);
            }
        });
        return this;
    }
});