Ext.define('IMMobile.base.Redirect', {
    singleton: true,
    alternateClassName: 'Redirect',

    // 重定向
    redirectTo(xtype) {
        const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        imMobile.push({
            xtype: xtype,
            itemId: xtype
        });
    }
});