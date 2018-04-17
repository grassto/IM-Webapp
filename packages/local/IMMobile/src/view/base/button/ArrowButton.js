Ext.define('IMMobile.view.base.button.ArrowButton', {
    extend: 'Ext.Button',
    xtype: 'arrButton',
    classCls: 'arrButton',

    config: {
        /**
         * 组合带箭头的text
         */
        arrText: '',
        /**
         * 展示带头像等信息的button
         */
        // bigDetailBtn: false
    },

    constructor(config) {
        config = config || {};
        config.ui = 'flat';
        config.textAlign = 'left';
        config.width = '100%';
        if(config.arrText) {
            config.text = '<div>' + config.arrText +
                            '<div style="float:right;">' +
                            '<div class="arrow"></div>' +
                            '</div>' +
                            '</div>';
                
        }



        this.callParent(arguments);
    }

});