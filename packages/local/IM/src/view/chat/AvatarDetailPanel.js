Ext.define('IM.view.chat.AvatarDetailPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'avatarDetail',

    requires: [
        'IM.model.viewModel.ChatViewDetail'
    ],

    viewModel: {
        type: 'chatView_detail'
    },

    floated: true,
    scrollable: 'y',
    bodyPadding: 20,
    height: 350,
    width: 250,

    // bind: {
    //     html: '{chatView_detail_html}'
    // },

    config: {
        hidden: true
    }
});