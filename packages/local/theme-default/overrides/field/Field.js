Ext.define(null, { //'App.override.field.Field'
    override: 'Ext.field.Field',

    config: {
        labelTextAlign: 'right',
        //errorTarget: 'side',
        errorTip: {
            anchor: true,
            align: 'l-r?',
            ui: 'tooltip invalid'
        }
    },

    platformConfig: {
        phone: {
            errorTarget: 'under'
        }
    }
});
