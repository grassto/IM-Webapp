Ext.define('IM.view.leftTab.organization.OrganizationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.left-orgController',

    /**
     * 组织结构树选中事件
     */
    orgOnSelectMem(sItem, index, target, record) {
        this.onShowDetails();
        this.onSetDetails(record);
    },

    /**
     * 展示详细信息
     */
    onShowDetails() {
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

    /**
     * 更改详细内容
     */
    onSetDetails(record) {
        var viewmodel = this.getViewModel();
        
        if(record.data.leaf) {
            viewmodel.set('btnText', '发起聊天');

            viewmodel.set('sendToName', record.data.nickname);
            // viewmodel.set('phone', );
            // viewmodel.set('mobile', );
            viewmodel.set('eMail', record.data.email);
            // viewmodel.set('department', );
            viewmodel.set('detailHtml', viewmodel.get('personHtml'));

        }else {
            viewmodel.set('btnText', '发起群聊');

            // viewmodel.set('company', );
            // viewmodel.set('org', );
            // viewmodel.set('personNum', );
            viewmodel.set('detailHtml', viewmodel.get('orgHtml'));
        }
    }
});