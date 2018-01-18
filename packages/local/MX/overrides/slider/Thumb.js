/**
 * bug fix: readonly 的 sliderfield 仍然可以拖拽
 */
Ext.define(null, { //'MX.overrides.slider.Thumb'
    override: 'Ext.slider.Thumb',

    onBeforeDragStart: function(source, info, event) {
        if (this.isDisabled()) {
            return false;
        }
        var xy = info.proxy.current;
        return this.getSlider().onThumbBeforeDragStart(this, event, xy.x, xy.y); //加个return
    }
});