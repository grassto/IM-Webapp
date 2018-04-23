/**
 * 分组的list，带人员选择
 */
Ext.define('IMCommon.view.list.GroupedList', {
    extend: 'Ext.List',
    xtype: 'groupedList',

    requires: [
        'IMCommon.utils.AvatarUtil',
        'IMCommon.model.PersonList'
    ],

    height: '100%',
    cls: 'support-select',
    indexBar: true,
    itemTpl: [
        '<div class="{[values.selList ? \'selList\':\'\']}" style="float:left">',
        '<div class="select"></div>',
        '</div>',
        '<div class="Content">',
        '<a class="avatar link-avatar firstletter " letter="{[AvatarUtil.getFirstLetter(values.user_name)]} " style="float:left;{[AvatarUtil.getColorStyle(values.user_name)]}">',
        '</a>',
        '{user_name}',
        '</div>'
    ].join(''),
    grouped: true,
    pinHeaders: false,
    selectable: false,
    itemsFocusable: false,


    defaultListenerScope: true,
    listeners: {
        childTap: 'onSelChild'
    },

    // 这样写会报错
    initialize() {
        // const me = this,
        //     store = me.getStore();

        // store.setData(User.allOthers);
        // // debugger;

        // const me = this;
        // me.on({
        //     childTap: 'onSelChild',
        //     scope: me
        // });
    },

    constructor(config) {
        // 最终的store还是使用这种方法才行
        config = Ext.applyIf({
            store: {
                model: 'IMCommon.model.PersonList',
                grouper: {
                    groupFn: function (record) {
                        // 根据首字母排序
                        return pinyinUtil.getFirstLetter(record.get('user_name'))[0];
                        // return record.get('firstName')[0];
                    }
                },
                data: User.allOthers,
                // listeners: {
                //     update: 'onChgCss',
                //     destroyable: true
                // },
                // onChgCss(store, records, index, eOpts) {
                //     debugger;
                // }
            }
        });

        this.callParent(arguments);
    },


    // 选择
    onSelChild(view, location) { // 继承的类，需要将childTap写在initialize里才能用
        // debugger;
        // var target = location.event.currentTarget,
        // div = Ext.fly(target);

        // if(div.hasCls('selList')) {
        //     div.removeCls('selList');
        // } else {
        //     div.addCls('selList');
        // }

        var record = location.record;
        if(record) {
            var data = record.data;
            if (data.selList) { // 已选中，置为未选中
                record.set('selList', false);
                // data.selList = false;
            } else {
                record.set('selList', true);
                // data.selList = true;
            }
        }

    }
});