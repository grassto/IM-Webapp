/**
 * 点击输入框旁边的+号，显示出来的更多功能面板
 */
Ext.define('IMMobile.view.chatView.editor.menu.More', {
    extend: 'Ext.Component',
    xtype: 'editor_more_menu',
    config: {
        cls: 'editor-more-menu media-ajust-menu',
        tpl: [
            '<tpl for=".">',
            '<div itemid="{value}" class="item x-layout-hbox x-vertical x-align-center">',
            '<div class="square-icon {iconCls}" style="background-color:{backColor}"></div>',
            '<div class="menu-text">{text}</div>',
            '</div>',
            '</tpl>'
        ].join('')
    },
    initialize() {
        this.callParent(arguments);

        this.innerElement.on({
            delegate: 'div.item',
            tap: 'onTapMenuItem',
            touchstart: 'onItemTouchStart',
            touchcancel: 'onItemTouchEnd',
            touchend: 'onItemTouchEnd',
            scope: this
        });

    },
    onItemTouchStart(e) {
        Ext.fly(e.getTarget()).addCls('pressed');
    },
    onItemTouchEnd(e) {
        Ext.fly(e.getTarget()).removeCls('pressed');
    },
    onTapMenuItem(e, target) {
        var t = e.getTarget(),
            v = t.getAttribute('itemid');
        this.fireEvent('tapmenu', this, v, t);
    }
});