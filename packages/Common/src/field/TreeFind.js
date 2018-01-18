/**
 * 树形查找 控件
 * @author jiangwei
 */
Ext.define('Common.field.TreeFind', {
    extend: 'Common.field.ListFind',
    requires: [
        'Common.picker.TreeFind'
    ],
    xtype: 'treefindfield',

    defaultListenerScope: true,

    classCls: 'treefind-field',

    tree: true,

    pickerXType: 'treefindpicker'

});