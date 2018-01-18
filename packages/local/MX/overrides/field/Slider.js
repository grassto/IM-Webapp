/**
 * 改进：实时显示拖拽的值，支持 tips 和 boxLabel 2种方式
 */
Ext.define(null, { // 'MX.override.field.Slider'
    override: 'Ext.field.Slider',
    requires: [
        'Ext.tip.ToolTip'
    ],

    useTips: false, // 实时显示拖拽的值

    /**
     * @cfg {Function} tipFormat
     */
    tipFormat: null,

    config: {
        showValueInBoxLabel: false, // 实时在boxLabel处显示值
        /**
         * @cfg {Function} boxLabelFormat
         */
        boxLabelFormat: null
    },

    initialize() {
        var me = this;
        me.callParent(arguments);

        me.getSlider().on({
            scope: this,
            drag: 'onSliderDrag2',
            dragstart: 'onSliderDragStart2',
            dragend: 'onSliderDragEnd2'
        });
    },
    getTipText(v) {
        var me = this;
        if (me.tipFormat) {
            return me.tipFormat.call(me, me, v);
        }

        return v;
    },
    getTipInstance() {
        var quickTips = Utils.getApp().getQuickTips();
        if (quickTips) {
            return quickTips.tip;
        }

        var tip = Ext.getCmp('global-tooltip');
        if (!tip) {
            tip = Ext.widget('tooltip', { id: 'global-tooltip' });
        }

        return tip;

    },
    onSliderDragStart2(slider, thumb, startValue, e) {
        var me = this;
        if (me.useTips) {
            var tip = me.getTipInstance();
            tip.setHtml(me.getTipText(startValue));
            tip.showBy(thumb, 'b-t');
        }
    },
    onSliderDrag2(slider, thumb, value, e) {
        var me = this;
        if (me.useTips) {
            var tip = me.getTipInstance();
            tip.setHtml(me.getTipText(value));
            tip.showBy(thumb, 'b-t');
        }
        if (me.getShowValueInBoxLabel()) {
            me.setBoxLabel(me.getBoxLabelText(value));
        }
    },
    onSliderDragEnd2(slider, thumb, value, e) {
        var me = this;
        if (me.useTips) {
            me.getTipInstance().hide();
        }
    },

    getBoxLabelText(v) {
        var me = this,
            format = me.getBoxLabelFormat();
        if (format) {
            return format.call(me, me, v);
        }

        return v;
    },
    updateValue(value, oldValue) {
        var me = this;
        me.callParent(arguments);
        if (me.useTips) {
            if (me.sliderTip) {
                me.sliderTip.setHtml(me.getTipText(value));
            }
        }
        if (me.getShowValueInBoxLabel()) {
            me.setBoxLabel(me.getBoxLabelText(value));
        }
    },
    updateShowValueInBoxLabel(show) {
        var me = this;
        if (show) {
            me.setBoxLabel(me.getBoxLabelText(me.getValue()));
        } else {
            me.setBoxLabel(null);
        }
    }
});