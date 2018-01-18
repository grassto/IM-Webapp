/**
 * 树形查找 弹出框
 * @author jiangwei
 */
Ext.define('Common.picker.TreeFind', {
    extend: 'Common.picker.ListFind',
    xtype: 'treefindpicker',

    classCls: 'treefind-picker',

    queryApi: 'store/OA.Common.AutoField/ExecQueryTree',

    width: 900,

    createItems(inf) {
        const me = this,
            tree = me.add(me.initTree(inf));

        me.callParent(arguments);

        const treeRoot = tree.getStore().getRoot(),
            nodes = treeRoot.childNodes;
        if (nodes && nodes.length) {
            tree.setSelection(nodes[0]);
        }
    },

    getConfiguration() {
        const me = this;
        me.ajax('ajax/OA.Common.AutoField/GetTreeFind', {
            data: {
                P0: me.findId,
                P1: me.findParams || {}
            },
            success(r) {
                me.inf = r; // 树形查找的设置
                me.idField = r.Source;
                me.nameField = r.Text;

                me.createItems(r);
            },
            scope: me
        });
    },

    initTree(inf) {
        const me = this,
            columns = [],
            fields = [],
            treeWidth = inf.TreeWidth * 1.5; //

        // 计算列宽
        let i,
            d;

        for (i = 0; i < inf.TreeColumns.length; i++) {
            d = inf.TreeColumns[i];
            var col = {
                dataIndex: d.DX,
                text: d.HD,
                width: d.WH * 1.5 //
            };
            if (i == 0) {
                col.xtype = 'treecolumn';
            }
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

        for (i = 0; i < inf.TreeColumns.length; i++) {
            d = inf.TreeColumns[i];
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
        const root = {
            expanded: true,
            children: me.treeify(inf.TreeData, inf.TreeID, inf.TreeParentID)
        };
        root[inf.TreeID] = 'root';

        return {
            xtype: 'tree',
            itemId: 'tree',
            docked: 'left',
            sortable: false,
            selectable: {
                mode: 'single',
                deselectable: false
            },
            width: treeWidth,
            rootVisible: false,
            columns,
            store: {
                type: 'tree',
                fields,
                root
            },
            listeners: {
                select: 'onTreeSelect',
                scope: me
            }
        };
    },

    /**
     * 树选择节点后触发
     * @param {Ext.grid.Tree} tree
     * @param {Ext.data.Model} selected
     */
    onTreeSelect(tree, selected) {
        const me = this,
            otherPas = {};
        Ext.each(me.inf.Relations, x => {
            otherPas[x] = selected.get(x);
        });

        me.findRelations = otherPas;
        me.onRefresh();
    },

    otherStoreParams() {
        return this.findRelations;
    },

    showFindId() {
        Utils.alert(`树形查找编号: ${this.findId}`);
    },

    /**
     * 组织树形数据
     * @param {Object[]} data
     * @param {String} idProp
     * @param {String} pIdProp
     */
    treeify(data, idProp, pIdProp) {
        if (!data || !data.length) return [];

        const me = this,
            level1rst = [];
        let item;
        for (item of data) {
            const curId = item[idProp],
                curPId = item[pIdProp],
                nodes = me.findChildrenBy(data, x => x[idProp] != curId && x[idProp] == curPId);

            if (!nodes.length) {
                item.expanded = true;
                level1rst.push(item);
            }
        }
        for (item of level1rst) {
            me.doTreeify(item, data, idProp, pIdProp);
        }

        return level1rst;
    },

    doTreeify(cur, data, idProp, pIdProp) {
        const me = this,
            nodes = me.findChildrenBy(data, x => x[idProp] != cur[idProp] && x[pIdProp] == cur[idProp]);

        if (nodes.length) {
            cur.children = nodes;
        }
        cur.leaf = !nodes.length;

        let innerItem;
        for (innerItem of nodes) {
            me.doTreeify(innerItem, data, idProp, pIdProp);
        }
    },

    findChildrenBy(data, fn) {
        const result = [];
        let item;
        for (item of data) {
            if (fn(item)) {
                result.push(item);
            }
        }

        return result;
    }
});