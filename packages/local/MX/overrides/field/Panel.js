/**
 * 为 fieldPanel 增加 readOnly 配置项
 */
Ext.define(null, { //'MX.override.field.Panel'
    override: 'Ext.field.Panel',

    config: {
        readOnly: null
    },
    
    updateReadOnly(readOnly, oldReadOnly){
        this.mixins.fieldmanager.updateReadOnly.call(this, readOnly, oldReadOnly);
    }
});