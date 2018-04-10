Ext.define('IMMobile.store.ChatOrg', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.ChatOrg',

    rootData: [{
        text: 'Groceries',
        items: [{
            text: 'Drinks',
            items: [{
                text: 'Water',
                items: [{
                    text: 'Sparkling',
                    leaf: true
                }, {
                    text: 'Still',
                    leaf: true
                }]
            }, {
                text: 'Coffee',
                leaf: true
            }, {
                text: 'Espresso',
                leaf: true
            }, {
                text: 'Redbull',
                leaf: true
            }, {
                text: 'Coke',
                leaf: true
            }, {
                text: 'Diet Coke',
                leaf: true
            }]
        }, {
            text: 'Fruit',
            items: [{
                text: 'Bananas',
                leaf: true
            }, {
                text: 'Lemon',
                leaf: true
            }]
        }, {
            text: 'Snacks',
            items: [{
                text: 'Nuts',
                leaf: true
            }, {
                text: 'Pretzels',
                leaf: true
            }, {
                text: 'Wasabi Peas',
                leaf: true
            }]
        }]
    }],
    defaultRootProperty: 'items',

    fields: [{
        name: 'name',
        type: 'string'
    }],

    constructor(config) {
        config = Ext.apply({
            root: Ext.clone(this.rootData)
        }, config);

        this.callParent([config]);
    }

});