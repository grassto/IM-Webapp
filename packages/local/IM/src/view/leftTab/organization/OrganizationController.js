Ext.define('IM.view.leftTab.organization.OrganizationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.left-orgController',

    // init() {
    //     debugger;
    //     BindHelper.loadOrganization(this.getView());
    // },

    /**
     * 组织结构树单击事件
     * @param {*} me 
     * @param {*} location 
     */
    orgOnSelectMem(me, location) {
        // debugger;
        this.onShowDetails();
        this.onSetDetails(location.record);
        // this.onOpenChat(record);
        this.getViewModel().set('orgSelRecord', location.record);
    },

    /**
     * 组织结构树双击事件
     * @param {*} me 
     * @param {*} location 
     */
    orgOnDblSelMem(me, location) {
        this.getViewModel().set('orgSelRecord', location.record);
        this.fireEvent('doubleTapOrg');
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
     * @param {object} record store中的数据
     */
    onSetDetails(record) {
        var viewmodel = this.getViewModel();

        if (record.data.leaf) {
            viewmodel.set('btnText', '发起聊天');

            viewmodel.set('sendToName', record.data.name);
            // viewmodel.set('phone', );
            // viewmodel.set('mobile', );
            viewmodel.set('eMail', record.data.email);
            // viewmodel.set('department', );
            viewmodel.set('isOrgDetail', false);

        } else {
            viewmodel.set({
                btnText: '发起群聊',
                org: record.data.name,
                'isOrgDetail': true
            });


            // viewmodel.set('company', );
            // viewmodel.set('org', );
            // viewmodel.set('personNum', );
            // viewmodel.set('isOrgDetail', true);
        }
    }



});