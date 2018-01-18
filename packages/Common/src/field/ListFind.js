/**
 * 清单查找 控件
 * @author jiangwei
 */
Ext.define('Common.field.ListFind', {
    extend: 'Ext.field.ComboBox',
    requires: [
        'Common.picker.ListFind'
    ],
    xtype: 'listfindfield',

    defaultListenerScope: true,

    classCls: 'listfind-field',

    config: {
        /**
         * @cfg {Number} findId
         * 查找编号
         */
        findId: null

        /* ,findPicker: {
            lazy: true,
            $value: true
        }*/
    },
    /**
     * @property {Boolean} matchMinFieldWidth
     * floated picker 最小宽度是控件的宽度?
     */
    matchMinFieldWidth: true,

    /**
     * @property {String} topViewXType
     * 用于 ctrlParamsMap 和 ctrlResultMap 的顶层容器xtype
     */
    topViewXType: null,

    // 返回赋值
    /**
     * @property {Object} assCtrlName
     * 关联文本字段控件Name
     */
    assCtrlName: null,

    /**
     * @property {Object} ctrlResultMap
     * 返回赋值到控件对应关系, 如{ AccountID: 'AccID' }, 表示把结果中 AccID 结果值赋给 AccountID控件
     */
    ctrlResultMap: null,

    /**
     * @property {Object} recordResultMap
     * 返回赋值到 record(编辑表格) 对应关系, 如 { AccountID: 'AccID' }, 表示把结果中AccID结果值赋给 record 的 AccountID 字段
     */
    recordResultMap: null,

    // 点击清空的x按钮时
    /**
     * @property {Boolean} clearAssOnClear
     * 清空 关联文本字段(name)控件?
     */
    clearAssOnClear: true,

    /**
     * @property {Boolean} clearCtrlOnClear
     * 清空 返回赋值控件?
     */
    clearCtrlOnClear: true,

    /**
     * @property {Boolean} clearEditRecordOnClear
     * 清空 返回赋值record的字段?
     */
    clearEditRecordOnClear: true,

    /**
     * @property {String} expandSql
     * 扩展数据sql(已加密,因为放在了前台,所以需要加密)
     */
    expandSql: null,

    // 参数
    /**
     * @property {Object} ctrlParamsMap
     * 来自控件的参数，参数名和控件 name 的对应关系，如 {PeriodYear: 'Period'}
     */
    ctrlParamsMap: null,

    /**
     * @property {Object} recordParamsMap
     * 来自编辑表格的 record 的参数，参数名和 field name 的对应关系，如 {PeriodYear: 'Period'}
     */
    recordParamsMap: null,

    /**
     * @property {Object} valueParams
     * 固定值参数 {PeriodYear: 2014}，ctrlParamsMap 和 valueParams 类似于AIO5中的urlQuery，一般作为查询参数
     */
    valueParams: null,

    /**
     * @property {Function} paramsFn
     * 某些复杂的参数不方便用上面三个表达，则可以写一个函数返回清单查找参数，函数有1个形参 me(当前field)
     */
    paramsFn: Ext.emptyFn,

    /**
     * @private
     * @property {Boolean} tree
     * 树形?
     */
    tree: false, // 树形?

    /**
     * @private
     * @property {String} pickerXType
     * 弹出框的 xtype
     */
    pickerXType: 'listfindpicker', // 

    forceSelection: true,
    triggerAction: 'query',
    minChars: 1,
    queryMode: 'remote',
    queryCaching: false,
    picker: 'floated',

    hideTrigger: true, // 隐藏下拉Trigger
    clearable: true,
    triggers: {
        tg: {
            iconCls: 'i-common-tg',
            handler: 'onTGTriggerClick',
            scope: 'this'
        }
    },

    valueField: 'value',
    displayField: 'value',
    matchFieldWidth: false, // floated picker 宽度是控件的宽度?

    itemTpl: '<span class="listfind-picker-value">{value:htmlEncode}</span>{label:htmlEncode}',

    store: {
        fields: [
            'value',
            'label',
            {
                name: 'data',
                type: 'auto'
            }
        ],
        remoteSort: true,
        remoteFilter: true,
        proxy: {
            type: 'ajax',
            api: 'store/OA.Common.AutoField/AutoSource'
        }
    },

    /**
     * @override
     * store请求filter会变为 { query: ["C", { property: 'XXX', value: 'YYY' }] }
     * 而不是 { query: "C", filter: [{ property: 'XXX', value: 'YYY' }] }
     * 所以需要重写下面 primaryFilter、queryParam 和 serializePrimaryFilter
     */
    primaryFilter: {
        id: 'primary-filter',
        property: 'query',
        value: '',
        disabled: true
    },

    queryParam: 'filter',

    /**
     * @override
     */
    serializePrimaryFilter(filter) {
        return Ext.util.Filter.prototype.serialize.call(filter);
    },

    /* applyFindPicker(picker) {
        var me = this;
        if (picker) {
            if (Ext.isBoolean(picker)) {
                picker = {};
            }

            if (picker.isWidget) {
                picker.ownerField = me;
            } else {
                picker = Ext.apply({
                    ownerField: me
                }, picker);

                me.fireEvent('beforefindpickercreate', me, picker);
                picker = Ext.create(picker);
                me.fireEvent('findpickercreate', me, picker);
            }
        }

        return picker;
    },

    updateFindPicker(picker, oldPicker) {
        if (oldPicker) {
            oldPicker.destroy();
        }
    },*/

    /**
     * @override
     */
    updateValue(v, oldV) {
        const me = this;
        //debugger
        me.callParent(arguments);
        //debugger
        if (!Ext.isEmpty(v) && !me.isInputing) {
            const rec = me.findRecordByValue(v);
            if (!rec) {
                if (me.getDisplayTpl()) {
                    const ass = me.assCtrlName;
                    let view, assCtrl;
                    if (!Ext.isEmpty(ass) && (view = me.getTopView()) && (assCtrl = view.down(`field[name=${ass}]`))) {
                        setTimeout(() => {
                            const record = me.createSelectionRecord({
                                value: v,
                                label: assCtrl.getValue()
                            });
                            me.getStore().loadData([record]);
                            me.setSelection(record);
                            me.setFieldDisplay(record);
                        }, 0);
                    }
                }
            }
        }
    },

    /**
     * @override
     */
    onInput(e) {
        const me = this;
        me.isInputing = true;
        //debugger
        me.callParent(arguments);

        delete me.isInputing;
        //debugger
        var v = me.getValue();
        if (!Ext.isEmpty(v)) {
            var rec = me.findRecordByValue(v);
            if (rec && rec.isEntered) {
                me.getStore().remove(rec);
            }
        }
    },

    /**
     * @override
     */
    initialize() {
        const me = this,
            store = me.getStore();
        me.callParent(arguments);

        store.on({
            beforeload: 'onBeforeAutoSource',
            scope: me
        });

        me.on({
            select: 'onAutoSelect',
            scope: me
        });

    },

    /**
     * 下拉自动完成请求数据之前，设置参数
     * @param {Ext.data.Store} store
     * @param {Ext.data.operation.Operation} op
     */
    onBeforeAutoSource(store, op) {
        const me = this;
        op.setParams(Ext.apply({}, op.getParams(), {
            data: Ext.encode({
                P1: me.getFindId(),
                P2: me.tree
            })
        }));

        // 更换 filters
        const filters = op.getFilters(),
            pas = me.buildParamValues();

        let i, v;
        for (i in pas) {
            if (pas.hasOwnProperty(i)) {
                v = pas[i];
                if (!Ext.isEmpty(v)) {
                    filters.push(new Ext.util.Filter({
                        property: i,
                        value: Ext.isArray(v) ? v.join(',') : v
                    }));
                }
            }
        }
    },

    /**
     * 取当前 grid 内正在编辑的 record
     * @return {Ext.data.Model}
     */
    getEditRecord() {
        /* if (this.context && this.context.record) {
            return this.context.record;
        }*/

        return null;
    },

    /**
     * 参数取值
     * @return {Object}
     */
    buildParamValues() {
        const me = this,
            view = me.getTopView(),
            cpas = me.ctrlParamsMap,
            vpas = me.valueParams,
            rpas = me.recordParamsMap,
            paramsFn = me.paramsFn,
            pas = {};

        let i;
        // 控件参数
        if (view && cpas) {
            for (i in cpas) {
                var field = view.down(`field[name=${cpas[i]}]`);
                if (field) {
                    pas[i] = field.getValue();
                }
            }
        }
        // 固定值参数
        if (vpas) {
            Ext.apply(pas, vpas);
        }
        // edit grid record参数
        if (rpas) {
            const rec = me.getEditRecord();
            if (rec) {
                for (i in rpas) {
                    pas[i] = rec.get(rpas[i]);
                }
            }
        }
        // 自定义函数参数
        if (paramsFn) {
            var fnPas = paramsFn.call(me, me); // 第一个 me 是 paramsFn 的作用域，第二个 me 是 paramsFn 的实参
            if (fnPas) {
                Ext.apply(pas, fnPas);
            }
        }

        return pas;
    },


    /**
     * 下拉自动完成 选择完成后触发
     * @param {Common.field.ListFind} item
     * @param {Ext.data.Model} record
     */
    onAutoSelect(item, record) {
        if (record.isEntered) return;

        const me = this,
            id = record.get('value'),
            name = record.get('label');
        let data = record.get('data');

        if (Ext.isString(data) && !Ext.isEmpty(data)) {
            data = Ext.decode(data);
        }
        me.onSingleSelect(id, name, data);
    },

    /**
     * 查找框 选择单个完成后触发
     * @param {String/Number} id
     * @param {String} name
     * @param {Object/String} data
     */
    onTGSingleSelect(id, name, data) {
        const me = this;
        me.getStore().loadData([{
            value: id,
            label: name,
            data: data
        }]);
        me.setValue(id || null);
    },

    onSingleSelect(id, name, data) {
        const me = this,
            editRec = me.getEditRecord(),
            ass = me.assCtrlName,
            cmap = me.ctrlResultMap,
            rmap = me.recordResultMap,
            view = me.getTopView();

        let i,
            sql;
        if (view) {
            if (!Ext.isEmpty(ass)) {
                var assCtrl = view.down(`field[name=${ass}]`);
                if (assCtrl) {
                    assCtrl.setValue(name);
                }
            }
            if (cmap) { // 返回赋值
                sql = me.expandSql;
                if (!Ext.isEmpty(sql)) {
                    me.ajax('ajax/OA.Common.AutoField/ExecExpand', {
                        data: {
                            P0: sql,
                            P1: me.getFindId(),
                            P2: id,
                            P3: name
                        },
                        success(result) {
                            result = result || [];
                            for (i in cmap) {
                                var ctrl = view.down(`field[name=${i}]`);
                                if (ctrl) {
                                    ctrl.setValue(data[cmap[i]] || (result.length > 0 ? result[0][cmap[i]] : null));
                                }
                            }
                        },
                        scope: me
                    });
                } else {
                    for (i in cmap) {
                        var ctrl = view.down(`field[name=${i}]`);
                        if (ctrl) {
                            ctrl.setValue(data[cmap[i]] || null);
                        }
                    }
                }
            }
        }
        if (editRec && rmap) {
            sql = me.expandSql;
            if (!Ext.isEmpty(sql)) {
                me.ajax('ajax/OA.Common.AutoField/ExecExpand', {
                    data: {
                        P0: sql,
                        P1: me.getFindId(),
                        P2: id,
                        P3: name
                    },
                    success(result) {
                        result = result || [];
                        for (i in rmap) {
                            editRec.set(i, data[rmap[i]] || (result.length > 0 ? result[0][rmap[i]] : null));
                        }
                    },
                    scope: me
                });
            } else {
                for (i in rmap) {
                    editRec.set(i, data[rmap[i]] || null);
                }
            }
        }

        me.fireEvent('autoselect', me, id, name, data, editRec);
    },

    /**
     * 查找框多选
     * @param {String[]/Number[]} ids
     * @param {String[]} names
     * @param {Object[]/String[]} datas
     */
    onTGMultiSelect(ids, names, datas) {
        var me = this;
        me.fireEvent('autoselect', me, ids, names, datas, me.getEditRecord());
    },

    /**
     * 清空控件值，连带清空其它控件
     */
    clearValue() {
        const me = this;
        me.callParent(arguments);

        const editRec = me.getEditRecord(),
            ass = me.assCtrlName,
            cmap = me.ctrlResultMap,
            rmap = me.recordResultMap,
            view = me.getTopView();

        let i;
        if (view) {
            if (!Ext.isEmpty(ass) && me.clearAssOnClear) { // clearAssOnClear
                const assCtrl = view.down(`field[name=${ass}]`);
                if (assCtrl) {
                    assCtrl.setValue(null);
                }
            }
            if (cmap && me.clearCtrlOnClear) { // clearCtrlOnClear
                for (i in cmap) {
                    const ctrl = view.down(`field[name=${i}]`);
                    if (ctrl) {
                        ctrl.setValue(null);
                    }
                }
            }
        }
        if (editRec && rmap && me.clearEditRecordOnClear) { // clearEditRecordOnClear
            for (i in rmap) {
                editRec.set(i, null);
            }
        }
        me.fireEvent('clear', me); // clear事件
    },

    /**
     * 点击tg按钮, 获取清单查找设置
     */
    onTGTriggerClick() {
        const me = this;

        if (me.tgConfig && me.tgConfig.UniqueID === me.getFindId()) {
            me.showTGWin();
        } else {
            delete me.tgConfig;
            me.ajax('ajax/OA.Common.AutoField/GetTGConfig', {
                data: {
                    P0: me.getFindId(),
                    P1: me.tree
                },
                success(r) {
                    me.tgConfig = r;
                    me.showTGWin();
                },
                //maskTarget: me
            });
        }
    },

    /**
     * 显示清单查找框
     */
    showTGWin() {
        const me = this,
            tgConfig = me.tgConfig;

        const win = Ext.widget(me.pickerXType, {
            title: tgConfig.PageTitle,
            ownerField: me, // 当前field的引用

            findId: me.getFindId(),
            findParams: me.buildParamValues(),
            multiple: me.multiple,
            resultOrder: me.resultOrder,
            addToGrid: me.addToGrid
        });
        win.show();
    },

    /**
     * @override
     * 设置 下拉列表最小宽度是控件的宽度
     */
    realignFloatedPicker(picker) {
        const me = this;
        me.callParent(arguments);

        picker = me.getConfig('picker', false, true);

        if (picker && picker.isVisible()) {
            if (me.matchMinFieldWidth) { // 下拉列表最小宽度是控件的宽度
                picker.setMinWidth(me[me.alignTarget].getWidth());
            }
        }
    },
    /**
     * @override
     * 设置 下拉列表最小宽度是控件的宽度
     */
    showPicker() {
        const me = this;
        me.callParent(arguments);
        const picker = me.getPicker();

        if (me.pickerType === 'floated') {
            if (me.matchMinFieldWidth) { // 下拉列表最小宽度是控件的宽度
                picker.setMinWidth(me[me.alignTarget].getWidth());
            }
        }
    },

    /**
     * @override
     */
    completeEdit() {
        const me = this,
            inputValue = me.getInputValue();

        // Don't want to callParent here, we need custom handling

        if (me.doFilterTask) {
            me.doFilterTask.cancel();
        }

        if (inputValue && !me.getSelection()) { // here 鼠标离开输入框的时候，会清空输入框，所以加个 !me.getSelection()
            me.syncMode = 'input';
            me.syncValue();
        }

        if (me.getTypeAhead()) {
            me.select(inputValue ? inputValue.length : 0);
        }
    },

    /**
     * 获取当前控件的上级容器
     * @return {Ext.Container}
     */
    getTopView() {
        const me = this;
        if (!Ext.isEmpty(me.topViewXType)) {
            return me.up(me.topViewXType);
        }

        return me.lookupNameHolder() || me.up('fieldset') || me.up('form') || me.up('container');
    },

    /**
     * @override
     */
    /*destroy() {
        const me = this;
        me.callParent(arguments);

        Ext.destroy(me._findPicker);
    }*/
});