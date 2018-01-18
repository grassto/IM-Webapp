/**
 * 显示 url 的 treecell
 */
Ext.define('MX.grid.cell.TreeUrl', {
    extend: 'Ext.grid.cell.Tree',
    xtype: 'treeurlcell',

    constructor(config) {

        const children = this.element.children[0].children,
            bodyEl = children[children.length - 1];

        if (bodyEl) {
            bodyEl.tag = 'a';
            bodyEl.href = 'javascript:;';
        }

        this.callParent(arguments);
    }

});