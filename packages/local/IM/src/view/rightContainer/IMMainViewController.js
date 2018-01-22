Ext.define('IM.view.rightContainer.IMMainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.im-right-main',

    onShowGrpSel() {
        this.fireEvent('grpSel');
    }
});