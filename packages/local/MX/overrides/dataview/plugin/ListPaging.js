/**
 * 改进：不需要后台返回total总数，根据 pageSize 配置 和 本页条数 比对，判断是否完全加载
 */
Ext.define(null, { //'MX.overrides.plugin.ListPaging'
    override: 'Ext.plugin.ListPaging',

    storeFullyLoaded() {
        var me = this,
            store = me.cmp.getStore(),
            pageSize = store.getPageSize(),
            lastLoadCnt = store.lastLoadCount,
            total = store.getTotalCount();
        if (lastLoadCnt !== undefined && lastLoadCnt < pageSize) {
            return true;
        }

        return total !== null ? total <= store.currentPage * pageSize : false;
    },
    onStoreLoad(store, records, successful, operation) {
        store.lastLoadCount = successful ? records.length : 0;
        this.callParent(arguments);
        //var list = this.getList();
        //delete list._listpagingloading;
    }
});