/**
 * 企业通讯录选人页面
 */
Ext.define('IMMobile.view.group.OrgSelMems', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-orgSelMems',

    requires: [
        'IMMobile.view.widget.Navbar'
    ],

    items: [{
        xtype: 'IMMobile-Navbar'
    }, {
        html: 'org'
    }]

});