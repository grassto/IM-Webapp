Ext.define('IM.model.Organization', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.organization',

    stores: {
        navItems: {
            fields: [
                'id', 'name',
                {
                    name: 'iconCls',
                    defaultValue: 'hide-icon'
                }
            ],
            type: 'tree',
            rootVisible: true,
            root: {
                mtype: 'orgTree',
                expanded: true,
                name: 'All',
                iconCls: 'hide-icon',
                children: [{
                    mtype: 'orgTree',
                    name: 'Home',
                    iconCls: 'hide-icon',
                    children: [{
                        mtype: 'orgTree',
                        name: 'Messages',
                        numItems: 231,
                        check: true,
                        iconCls: 'hide-icon',
                        leaf: true
                    }, {
                        mtype: 'orgTree',
                        name: 'Archive',
                        iconCls: 'hide-icon',
                        children: [{
                            mtype: 'orgTree',
                            name: 'First',
                            numItems: 7,
                            check: false,
                            iconCls: 'hide-icon',
                            leaf: true
                        }, {
                            mtype: 'orgTree',
                            name: 'No Icon',
                            numItems: 0,
                            check: true,
                            iconCls: 'hide-icon',
                            leaf: true
                        }]
                    }, {
                        mtype: 'orgTree',
                        name: 'Music',
                        numItems: 3000,
                        iconCls: 'hide-icon',
                        leaf: true
                    }, {
                        mtype: 'orgTree',
                        name: 'Video',
                        numItems: 1000,
                        iconCls: 'hide-icon',
                        leaf: true
                    }]
                }, {
                    mtype: 'orgTree',
                    name: 'Users',
                    iconCls: 'hide-icon',
                    children: [{
                        mtype: 'orgTree',
                        name: 'Tagged',
                        numItems: 53,
                        iconCls: 'hide-icon',
                        leaf: true
                    }, {
                        mtype: 'orgTree',
                        name: 'Inactive',
                        numItems: 9,
                        iconCls: 'hide-icon',
                        leaf: true
                    }]
                }, {
                    mtype: 'orgTree',
                    name: 'Groups',
                    numItems: 3,
                    iconCls: 'hide-icon',
                    leaf: true
                }, {
                    mtype: 'orgTree',
                    name: 'Settings',
                    iconCls: 'hide-icon',
                    children: [{
                        mtype: 'orgTree',
                        name: 'Sharing',
                        numItems: 4,
                        iconCls: 'hide-icon',
                        leaf: true
                    }, {
                        mtype: 'orgTree',
                        name: 'Notifications',
                        numItems: 16,
                        // iconCls: 'hide-icon',
                        leaf: true
                    }, {
                        mtype: 'orgTree',
                        name: 'Network',
                        numItems: 4,
                        // iconCls: 'hide-icon',
                        leaf: true
                    }]
                }]
            }

        }
    }
});