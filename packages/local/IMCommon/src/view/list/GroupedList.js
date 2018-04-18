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
        '<div style="float:left">',
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
    // store: 'List' 这样写无效
   

    defaultListenerScope: true,
    listeners: {
        childTap: 'onSelChild'
    },

    constructor(config) {
        // 最终的store还是使用这种方法才行
        config = Ext.applyIf({
            store: {
                model: 'IMCommon.model.PersonList',
                // data: User.allUsers, 这样也不行
                grouper: {
                    groupFn: function(record) {
                        // 根据首字母排序
                        return pinyinUtil.getFirstLetter(record.get('user_name'))[0];
                        // return record.get('firstName')[0];
                    }
                },
                data: User.allUsers
            }
        });

        this.callParent(arguments);
    },

    // 这样写会报错
    // initialize() {
    //     const me = this,
    //     store = me.getStore();

    //     // 获取数据进行绑定
    //     store.add(User.allUsers);
    // },

    // 选择
    onSelChild(view, location) {
        var target = location.event.currentTarget,
        div = Ext.fly(target);

        if(div.hasCls('selList')) {
            div.removeCls('selList');
        } else {
            div.addCls('selList');
        }
    }
});