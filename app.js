/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'PushIM.Webapp.Application',

    name: 'PushIM.Webapp'

    // requires: [
    //     // This will automatically load all classes in the PushIM.Webapp namespace
    //     // so that application classes do not need to require each other.
    //     'PushIM.Webapp.*'
    // ],

    // // The name of the initial view to create.
    // mainView: 'PushIM.Webapp.view.main.Main'
});
