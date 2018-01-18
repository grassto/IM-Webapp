/**
 * 改进：为 button 增加 href 设置
 */
Ext.define(null, { // 'MX.overrides.Button'
    override: 'Ext.Button',

    href: null,

    config: {
        /**
         * @cfg {Boolean} circularProgress
         * 按钮禁用时 显示圆形旋转的进度条
         */
        circularProgress: null
    },
    circularProgressCls: 'circular-progress',

    updateCircularProgress(p) {
        const me = this;

        Ext.destroy(me.progressBar);
        delete me.progressBar;

        if (me.getDisabled() && p) {
            me.createCircularProgress();
        }
    },

    updateDisabled(d) {
        const me = this;
        me.callParent(arguments);

        Ext.destroy(me.progressBar);
        delete me.progressBar;

        if (me.getCircularProgress() && d) {
            me.createCircularProgress();
        }
    },
    createCircularProgress() {
        const me = this;
        me.progressBar = me.element.appendChild({
            tag: 'span',
            cls: me.circularProgressCls,
            html: '<svg class="indeterminate" viewBox="0 0 50 50""><circle cx="25" cy="25" r="20" fill="none" stroke-width="3.6"></circle></svg>'
        });
    },

    /* initialize(){
        var me = this;
        me.callParent(arguments);
        me.element.on({
            taphold: 'onTapHold',
            scope: me
        });
    },
    onTapHold(e){
        var me = this;
        me.isTapHold = true; //增加标识：是否长按操作

        var tooltip = me.tooltip;
        if (!Ext.isEmpty(tooltip)) {
            Utils.toastShort(tooltip);
        }
    },*/

    onTap(e) {
        var me = this;
        // if (!me.isTapHold) { //有长按标识，则不执行下面的代码
        me.callParent(arguments);

        var href = me.href;
        if (!Ext.isEmpty(href)) {
            Ext.app.Application.instance.redirectTo(href);
        }
        /* }
        else {
            if(me.getDisabled()) return;
            me.fireEvent('holdnotap', me, e);
            delete me.isTapHold; //否则清除长按标识
        }*/
    },

    destroy() {
        const me = this;
        me.callParent(arguments);

        Ext.destroy(me.progressBar);
        delete me.progressBar;
    }
});