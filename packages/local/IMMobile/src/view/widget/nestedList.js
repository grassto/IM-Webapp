/**
 * 测试nestedlist使用的
 */
Ext.define('IMMobile.nestedList', {
    extend: 'Ext.NestedList',
    xtype: 'IMMobile11',

    requires: ['IMMobile.model.ChatOrg'],

    fullscreen: true,
    displayField: 'text',

    constructor(config) {
        var model = Ext.create('IMMobile.model.ChatOrg');
        config = Ext.apply({
            // 这个store只有这样create出来的才有效果，define的不行
            store: Ext.create('Ext.data.TreeStore', {
                fields: [{
                    name: 'text',
                    type: 'string'
                }],
                defaultRootProperty: 'items',
                rootVisible: true,
                root: {
                    items: [{
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
                    }]
                }
            })
        }, config);

        this.callParent([config]);
    }
});