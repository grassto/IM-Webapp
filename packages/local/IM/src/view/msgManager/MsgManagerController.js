Ext.define('IM.view.msgManager.msgManagerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.msgManager',

    /**
    * 高级搜索，打开panel
    */
    onAdvancedSearch(field) {
        const panel = this.getQuickAddPanel();
        if (panel.getParent() !== Ext.Viewport) {
            Ext.Viewport.add(panel);
        }
        // bug，直接 showBy 有时候不显示，所以加下面2行
        panel._hidden = true;
        panel.setHidden(false);

        panel.showBy(field.element, 'tl-bl?');
    },

    /**
    * 获取 快速新增 panel
    */
    getQuickAddPanel() {
        const me = this.getView().down('#msgSearchTxt');
        if (!me.quickAddPanel) {
            me.quickAddPanel = Ext.widget('ASPanel', {
                ownerCmp: me,
                listeners: {
                    show(p) {
                        me.setRequired(true);
                    },
                    hide(p) {
                        p.reset();
                        if (p.getParent() === Ext.Viewport) {
                            Ext.Viewport.remove(p, false);
                        }
                        me.setRequired(false);
                        me.blur();
                    },
                    ok: 'onSearchOk', // 自定义监听函数
                    scope: me
                }
            });
        }

        return me.quickAddPanel;
    },

    /**
     * 若存在高级选项panel，则将其隐藏
     */
    msgBeforeHide() {
        var advPanel = this.getView().down('#msgSearchTxt').quickAddPanel;
        if(advPanel) advPanel.hide();
    }
});