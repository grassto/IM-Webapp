/**
 * menuitem 默认 href="#", 导致 url 路由被改变
 * 此处改为 javascript:void(0);
 */
Ext.define(null, { //'MX.overrides.menu.Item'
    override: 'Ext.menu.Item',

    config: {
        href: 'javascript:void(0);'
    }
});