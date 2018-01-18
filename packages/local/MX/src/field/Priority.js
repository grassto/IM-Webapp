/**
 * 优先级 Field控件
 */
Ext.define('MX.field.Priority', {
    extend: 'Ext.field.Field',
    xtype: 'mx_priorityfield',

    config: {
        readOnly: false,

        clearable: false
    },

    inputValues: [{
        value: '',
        cls: 'none',
        text: '无'
    }, {
        value: 'L',
        cls: 'L',
        text: '低'
    }, {
        value: 'M',
        cls: 'M',
        text: '中'
    }, {
        value: 'H',
        cls: 'H',
        text: '高'
    }],

    symbolCls: 'pri-symbol',

    classCls: `${Ext.baseCSSPrefix}priorityfield`,

    /**
     * @cfg {Object} scope
     * The scope to execute the {@link #renderer} function. Defaults to `this` component.
     */

    initialize() {
        var me = this;
        me.callParent();

        me.inputElement.on({
            delegate: '.pri-btn',
            tap: 'onTapPriBtn',
            scope: me
        });

        me.syncDom();
    },

    /**
     * @private
     */
    getBodyTemplate() {
        const me = this,
            btns = [];

        Ext.each(me.inputValues, v => {
            btns.push({
                cls: `pri-btn ${v.cls} x-layout-box x-align-center`,
                children: [{
                    cls: `${me.symbolCls} ${v.cls}`
                }, {
                    text: v.text,
                    cls: 'pri-text'
                }]
            });
        });

        return [{
            reference: 'inputElement',
            cls: `${Ext.baseCSSPrefix}input-el x-layout-box`,
            children: btns
        }];
    },

    /*applyValue(v) {
        if (Ext.isEmpty(v) || v == ' ') return '';

        return this.callParent([v]);
    },*/

    updateValue(newValue, oldValue) {
        this.callParent([newValue, oldValue]);
        this.syncDom();
    },

    onTapPriBtn(e) {
        const me = this;
        if (me.getDisabled() || me.getReadOnly()) return;

        var selectedEl = Ext.fly(e.delegatedTarget),
            value;

        if (me.getClearable()) {
            if (selectedEl.hasCls('selected')) {
                me.setValue(null);

                return;
            }
        }

        Ext.each(me.inputValues, v => {
            if (selectedEl.hasCls(v.cls)) {
                value = v.value;

                return false;
            }
        });

        me.setValue(value);
    },

    privates: {
        syncDom() {
            var me = this,
                value,
                cls;

            if (!me.isConfiguring) {
                value = me.getValue();

                Ext.each(me.inputValues, v => {
                    if (value == v.value) {
                        cls = v.cls;

                        return false;
                    }
                });

                me.inputElement.select('.pri-btn').each(function (el) {
                    if (el.hasCls(cls)) {
                        el.addCls('selected');
                    } else {
                        el.removeCls('selected');
                    }
                });
            }
        }
    }
});