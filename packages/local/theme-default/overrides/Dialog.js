Ext.define(null, { //'App.overrides.Dialog'
    override: 'Ext.Dialog',

    config: {
        border: false,
        maxHeight: '90vh',
        maxWidth: '90vw',
        buttonAlign: 'right',
        buttonToolbar: {
            ui: 'footer'
        },
        resizable: {
            edges: 'all'
        },
        showAnimation: null,
        hideAnimation: null
    }
});
