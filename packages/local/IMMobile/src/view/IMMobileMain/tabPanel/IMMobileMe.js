Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileMe', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-Me',

    controller: 'IMMobileMeController',

    requires: [
        'IMMobile.view.widget.Navbar',
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController',

        'IMMobile.view.base.Container',
        'IMMobile.view.base.button.ArrowButton'
    ],

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        backBtn: false,
        titleMsg: '我'
    }, {
        xtype: 'baseBackcolor',
        margin: '10px',
        items: [{
            xtype: 'button',
            ui: 'flat',
            cls: 'bigButton',
            width: '100%',
            text: ['<div class="wrapper">',
            '<div class="avatarPic"></div>',
            '<div class="componentText">普实软件</div>',
            '<div class="personalText">张雨</br><p class="jobText">员工</p></div>',
            '</div>'].join('')
        }]
    }, {
        xtype: 'baseBackcolor',
        flex: 1,
        items: [{
            xtype: 'arrButton',
            arrText: '设置',
            // handler: 'onLogout'
        }]
    }]
});