Ext.define('IM.view.leftTab.organization.OrganizationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.left-orgController',

    orgOnSelectMem() {
        var rootView = this.getView().up('IM'),
            detailsView = rootView.lookup('details');
        if (!detailsView) { // 存在了就不切换
            var imMainView = rootView.lookup('im-main'),
                blankView = rootView.lookup('pageblank');
            if (imMainView) {
                this.fireEvent('showRight', 'details', 'im-main');
            }
            if (blankView) {
                this.fireEvent('showRight', 'details', 'pageblank');
            }
        }

    },
});