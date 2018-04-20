Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileMeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IMMobileMeController',

    uses: [
        'IMMobile.view.IMMobileMain.details.setting'
    ],

    onOpenSetting() {
        Redirect.redirectTo('IMMobile-Setting');
    },

    onLogout() {
        this.fireEvent('logout');
    }
});