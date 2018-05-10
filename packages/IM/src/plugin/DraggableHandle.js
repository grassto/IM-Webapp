/**
 * 拖拽+最大化 插件
 */
Ext.define('IM.plugin.DraggableHandle', {
    alias: 'plugin.draggablehandle',

    init(cmp) {
        // 获取下拉框数据源, 程序运行期间，只获取一次，放到类的 statics 静态属性中
        const me = this;

        // 可拖拽
        cmp.element.setStyle({
            '-webkit-app-region': 'drag'
        });

        cmp.element.on({
            doubletap: 'onDoubleTap',
            scope: me
        });
    },

    /**
     * 双击最大化/还原
     */
    onDoubleTap() {
        if(window.cefMain) {
            cefMain.max();
        }
    }
});