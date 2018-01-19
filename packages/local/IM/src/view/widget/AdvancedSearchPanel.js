/**
 * 高级搜索Panel
 */
Ext.define('IM.view.widget.AdvancedSearchPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'ASPanel',

    itemId: 'ASPanel',
    defaultListenerScope: true, // 设置方法的作用域为当前自身

    floated: true,
    scrollable: 'y',
    bodyPadding: 20,

    buttonAlign: 'right',

    defaults: {
        labelWidth: 'auto'
    },

    buttons: [{
        text: '搜索',
        ui: 'action',
        handler: 'onOk'
    }, {
        text: '关闭',
        ui: 'flat',
        handler: 'onCancle'
    }],

    constructor(config) {
        config = config || {};
        config.items = [{
            xtype: 'textfield',
            label: '参与人'
        }, {
            xtype: 'textfield',
            label: '群名'
        }, {
            xtype: 'textfield',
            label: '聊天记录'
        }, {
            xtype: 'combobox',
            label: '时间',
            displayField: 'name',
            valueField: 'time',
            store: [
                {time:'all', name:'不限'},
                {time:'week', name:'最近七天'},
                {time:'year', name:'最近一年'},
                {time:'threeYear', name:'最近三年'}
            ]
        }/* , {
            xtype: 'textfield',
            label: '文件'
        }*/];

        this.callParent([
            config
        ]);
    },

    onOk() {
        this.fireEvent('ok'); // 调用搜索框的ok事件
    },

    onCancle() {
        this.hide();
    }
});