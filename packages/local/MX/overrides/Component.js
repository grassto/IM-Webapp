/**
 * 为 component 加上 ajax 方法，在 component 销毁时，ajax 也将 abort
 * 增加自定义配置 modalBgColor
 */
Ext.define(null, { //'MX.overrides.Component'
    override: 'Ext.Component',

    modalBgColor: null, // mask 背景色（只有 floated为true的时候可用）

    //给component新增一个 ajax 方法，可以不用 Utils.ajax，而用此控件的 ajax
    //这样这个ajax请求就被此控件管理了, 此控件在destroy的时候就会abort这个ajax
    ajax() {
        var me = this,
            args = arguments,
            last = args[args.length - 1];

        if (last.success || last.failure || last.callback || last.scope || last.loadTarget !== undefined || last.maskTarget !== undefined || last.button) {
            last.ajaxHost = me;
        }

        return Utils.ajax.apply(Utils, arguments);
    },

    destroy() {
        var me = this;

        me.abortAllAjax();

        me.callParent(arguments);
    },

    abortAllAjax() {
        var me = this;

        if (me.ajaxRequests) { //与此component有关的ajax请求
            for (var i in me.ajaxRequests) {
                Ext.Ajax.abort(me.ajaxRequests[i]); //都需要在destroy时abort
                delete me.ajaxRequests[i];
            }
            delete me.ajaxRequests;
        }
    },

    getModalMask() {
        var me = this,
            floatParentNode = me.floatParentNode;

        if (floatParentNode) {

            if (me.getFloated() && me.getModal() === true) {

                var data = floatParentNode.getData(),
                    floatRoot = Ext.getFloatRoot();

                if (floatParentNode !== floatRoot && !data.component.getRelative()) {
                    data = floatRoot.getData();
                }

                return data.modalMask;
            }
        }

        return null;
    },
    privates: {
        showModalMask() {
            var me = this;
            me.callParent(arguments);

            var mask = me.getModalMask();
            if (mask) {
                mask.setStyle('background-color', me.modalBgColor);
            }
        },

        hideModalMask() {
            var me = this;
            me.callParent(arguments);

            var mask = me.getModalMask();
            if (mask) {
                mask.setStyle('background-color', null);
            }
        }
    },

    /**
     * 在容器内 showBy
     * 默认的 showBy 的参照物是 Ext.Viewport
     */
    showByInside(component, alignment, options) {
        const me = this,
            parentEl = me.element && me.element.getParent();
        if (!parentEl) return;

        // trick
        // 如果直接 showBy(region), region 会被改变
        const target = {
            isWidget: true,
            el: {
                getRegion() {
                    const cmpEl = component.element,
                        offsets = cmpEl.getOffsetsTo(parentEl),
                        sizeB = cmpEl.getSize(),
                        t = parentEl.dom.scrollTop + offsets[1],
                        l = parentEl.dom.scrollLeft + offsets[0];

                    return new Ext.util.Region(t, l + sizeB.width, t + sizeB.height, l);
                }
            }
        };

        me.setHidden(false);
        me.showBy(target, alignment, options);
    }
});