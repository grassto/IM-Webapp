/**
 * 清单查找 弹出框
 * @author jiangwei
 */
Ext.define('Common.picker.ListFind', {
    extend: 'Ext.Dialog',
    xtype: 'listfindpicker',

    classCls: 'listfind-picker',

    defaultListenerScope: true,

    /**
     * @property {Number} findId
     * 清单查找编号
     */
    findId: null,

    /**
     * @property {Object} findParams
     * 参数如{PeriodYear: 2014}
     */
    findParams: null,

    /**
     * @property {Boolean} resultOrder
     * 返回结果是否按照选中行的顺序?
     */
    resultOrder: true,

    /**
     * @property {Boolean} multiple
     * 多选?
     */
    multiple: false,

    /**
     * @property {Boolean} addToGrid
     * 是否用于添加到表格?
     */
    addToGrid: false,

    /**
     * @private
     * @property {String} idField
     * 值字段
     */
    idField: null,

    /**
     * @private
     * @property {String} nameField
     * 文本字段
     */
    nameField: null,

    /**
     * @private
     * @property {String} queryApi
     * 表格查询的 api
     */
    queryApi: 'store/OA.Common.AutoField/ExecQuery',

    border: false,
    closable: true,
    resizable: true,
    width: 800,
    height: '90vh',
    maxWidth: '90vw',

    layout: 'fit',

    buttonToolbar: {
        ui: 'footer'
    },

    constructor(config) {
        const me = this;
        config = config || {};

        if (me.addToGrid) {
            config.buttonAlign = 'left';
            config.buttons = [{
                text: '关闭',
                ui: 'flat',
                handler: 'onCancle',
                scope: me
            }, '->', {
                xtype: 'numberfield',
                width: 75,
                name: 'txtQty',
                value: 1
            }, {
                ui: 'action',
                text: '增加到表格',
                handler: 'onAddRow',
                scope: me
            }];
        } else {
            config.buttonAlign = 'right';
            config.buttons = [{
                ui: 'action',
                text: '确定',
                handler: 'onEnter',
                scope: me
            }, {
                text: '取消',
                ui: 'flat',
                handler: 'onCancle',
                scope: me
            }];
        }

        me.callParent([config]);
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.getConfiguration();

    },

    getConfiguration() {
        const me = this;
        me.ajax('ajax/OA.Common.AutoField/GetListFind', {
            data: {
                P0: me.findId
            },
            success(r) {
                me.inf = r; // 清单查找的设置
                me.idField = r.Source;
                me.nameField = r.Text;

                me.createItems(r);

                me.onRefresh();
            },
            scope: me
        });
    },

    createItems(inf) {
        var me = this;
        me.add([{
            xtype: 'container',
            docked: 'top',
            layout: {
                type: 'hbox',
                align: 'stretch' // 纵向伸展
            },
            items: [{
                xtype: 'fieldpanel',
                itemId: 'condForm',
                padding: '10 10 5',
                flex: 1,
                items: me.initPaCtrls(inf)
            }, {
                xtype: 'container',
                padding: '10 10 0',
                layout: {
                    type: 'vbox',
                    align: 'end',
                    pack: 'end'
                },
                items: [{
                    xtype: 'button',
                    itemId: 'btnSearchAny',
                    margin: '0 0 10',
                    width: 80,
                    text: '模糊搜索',
                    handler: 'onRefreshAny',
                    scope: me
                }, {
                    xtype: 'button',
                    ui: 'action',
                    width: 80,
                    margin: '0 0 10',
                    itemId: 'btnSearch',
                    text: '搜索',
                    handler: 'onRefreshStart',
                    scope: me
                }]
            }]
        }, me.initGrid(inf)]);
    },

    initPaCtrls(inf) {
        const me = this,
            allCtrls = [],
            findParams = me.findParams || {};
        let x, y, i;
        for (x = 0; x < inf.Rows.length; x++) {
            var rowCtrls = [];
            for (y = 1; y <= inf.Cols.length; y++) {
                var colCtrl = {};
                for (i = 0; i < inf.Params.length; i++) {
                    var d = inf.Params[i];
                    if (d.Y == inf.Rows[x] && d.X == inf.Cols[y - 1]) {
                        // 根据d.ID参数名取参数值
                        // var val
                        if (d.Ct == 'ComboBox') {
                            colCtrl.xtype = 'selectfield';
                            colCtrl.options = Ext.decode(d.JSON);
                        } else if (d.Ct == 'CheckBox') {
                            var obj = Ext.decode(d.JSON);
                            colCtrl.xtype = 'mx_checkbox';
                            colCtrl.valueChecked = obj.ValueChecked;
                            colCtrl.valueUnChecked = obj.ValueUnChecked;
                        } else if (d.Ct == 'DatePicker') {
                            colCtrl.xtype = 'datepickerfield';
                        } else if (d.Ct == 'PopupEdit') {
                            const obj = Ext.decode(d.JSON.replace(/\r\n/g, '|'));
                            colCtrl.xtype = 'listfindfield';
                            colCtrl.findId = obj.ListFindID;

                            if (!Ext.isEmpty(obj.FindParams)) {
                                const pa = {},
                                    list = obj.FindParams.replace(/[@\t ]/g, '').split('|');
                                Ext.each(list, function (item) {
                                    var pair = item.split('=');
                                    if (pair.length == 2) pa[pair[0]] = pair[1];
                                });
                                colCtrl.valueParams = pa;
                            }
                        } else {
                            colCtrl.xtype = 'textfield';
                        }
                        colCtrl.width = d.WH * 1.5; //
                        colCtrl.label = d.Lb;
                        colCtrl.name = d.ID;
                        colCtrl.clearable = true;
                        colCtrl.value = findParams[d.ID] || null;
                    }
                }
                rowCtrls.push(colCtrl);
            }
            if (rowCtrls.length == 1) {
                allCtrls.push(rowCtrls[0]);
            } else {
                allCtrls.push({
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: rowCtrls
                });
            }
        }

        allCtrls.push({
            xtype: 'mx_hiddenfield',
            name: 'Like',
            value: 'Start'
        });

        return allCtrls;
    },

    initGrid(inf) {
        const me = this,
            columns = [],
            fields = [],
            gridListeners = {
                scope: me
            },
            selectable = {
                mode: 'single'
            };
        let gridWidth = inf.Width * 1.5; //
        // me.multiple是控件的配置
        // inf.Multi是清单查找的设置
        if (me.multiple && inf.Multi && !me.addToGrid) {
            selectable.checkbox = 'only';
            gridWidth -= 35;
        } else if (me.addToGrid) {
            selectable.mode = 'multi';
        }

        // 计算列宽
        let sumWidth = 0,
            i,
            d;
        for (i = 0; i < inf.Columns.length; i++) {
            d = inf.Columns[i];
            if (d.Idx >= 0) sumWidth += d.WH * 1.5; //
        }

        for (i = 0; i < inf.Columns.length; i++) {
            d = inf.Columns[i];
            if (d.Idx < 0) continue;
            var col = {
                dataIndex: d.DX,
                text: d.HD,
                width: d.WH * gridWidth * 1.5 / sumWidth //
            };
            if (d.Format == 'HtmlEncode') {
                col.renderer = function (value, metadata, record) {
                    return Ext.htmlEncode(value);
                };
            } else if (d.Format == '{0:yyyy-MM-dd}') {
                col.xtype = 'datecolumn';
            } else if (d.Format == '{0:yyyy-MM-dd HH:mm}') {
                col.xtype = 'datetimecolumn';
            }
            columns.push(col);
        }

        for (i = 0; i < inf.Columns.length; i++) {
            d = inf.Columns[i];
            if (d.Format == 'HtmlEncode') {
                fields.push({
                    name: d.DX
                });
            } else if (d.Format == '{0:yyyy-MM-dd}') {
                fields.push({
                    name: d.DX,
                    type: 'date'
                });
            } else if (d.Format == '{0:yyyy-MM-dd HH:mm}') {
                fields.push({
                    name: d.DX,
                    type: 'date'
                });
            } else {
                if (!Ext.isEmpty(d.Format)) {
                    fields.push({
                        name: d.DX,
                        type: 'float'
                    });
                } else {
                    fields.push({
                        name: d.DX
                    });
                }
            }
        }

        if (me.addToGrid) {
            gridListeners.childdoubletap = 'onAddRow';
        } else {
            gridListeners.childdoubletap = 'onEnter';
        }

        const grid = Ext.create({
            xtype: 'grid',
            itemId: 'grid',
            rowNumbers: {
                text: '#'
            },
            columns,
            selectable,
            store: {
                fields: fields,
                remoteFilter: true,
                remoteSort: true,
                pageSize: inf.PageSize,
                proxy: {
                    type: 'ajax',
                    api: me.queryApi,
                    extraParams: {
                        data: Ext.encode({
                            P1: me.findId,
                            P2: me.findParams || {}
                        })
                    }
                },
                listeners: {
                    beforeload: 'beforeStoreLoad',
                    scope: me
                }
            },
            plugins: {
                gridpagingtoolbar: true
            },
            listeners: gridListeners
        });

        const bar = grid.down('pagingtoolbar');
        if (bar) {
            bar.add({
                iconCls: 'i-common-number',
                handler: 'showFindId',
                tooltip: '查找编号',
                scope: me
            });
        }

        return grid;
    },

    beforeStoreLoad(store, operation) {
        const me = this,
            condForm = me.down('#condForm');
        if (condForm) {
            const vals = Ext.apply({}, condForm.getValues(), me.otherStoreParams()),
                filters = [];

            for (var i in vals) {
                var value = vals[i],
                    v = Ext.isArray(value) ? value.join(',') : value;
                filters.push(new Ext.util.Filter({
                    property: i,
                    value: v
                }));
            }
            operation.setFilters(filters);
        }
    },

    /**
     * 表格 store 加载的其他 filter
     */
    otherStoreParams() {
        return null;
    },

    onRefresh() {
        const me = this,
            grid = me.down('#grid'),
            store = grid.getStore();
        store.loadPage(1);
    },
    onRefreshAny(btn) {
        this.down('field[name=Like]').setValue('AnyWhere');
        this.onRefresh();
    },
    onRefreshStart(btn) {
        this.down('field[name=Like]').setValue('Start');
        this.onRefresh();
    },
    changePageSize(editor, value, startValue) {
        if (value != startValue) {
            const me = this,
                grid = me.down('#grid'),
                store = grid.getStore();
            if (store) {
                store.setPageSize(value);
                store.loadPage(1);
            }
        }
    },
    showFindId() {
        Utils.alert(`清单查找编号: ${this.findId}`);
    },

    onEnter() {
        const me = this,
            grid = me.down('#grid');
        if (me.multiple && me.inf.Multi && !me.addToGrid) {
            var array = []; // Pnt.getGridSelRows(grid, me.resultOrder);

            if (array.length > 0) {
                var idList = [],
                    nameList = [],
                    dataList = [];
                Ext.each(array, function (rec) {
                    idList.push(rec.get(me.idField));
                    nameList.push(rec.get(me.nameField));
                    dataList.push(rec.data);
                });
                me.fireEvent('tgselect', me, idList, nameList, dataList); // 因为此window查找框可以单独用，比如点击一个按钮。所以在此触发一个tgselect事件

                if (me.ownerField) {
                    me.ownerField.onTGMultiSelect(idList, nameList, dataList);
                }
            }
        } else {
            const records = grid.getSelections();
            if (records.length > 0) {
                var rec = records[0],
                    id = rec.get(me.idField),
                    name = rec.get(me.nameField),
                    data = rec.data;

                me.fireEvent('tgselect', me, id, name, data); // 因为此window查找框可以单独用，比如点击一个按钮。所以在此触发一个tgselect事件

                if (me.ownerField) {
                    me.ownerField.onTGSingleSelect(id, name, data);
                }

            }
        }
        me.close();
    },

    onAddRow() {

    },

    onCancle() {
        this.close();
    }
});