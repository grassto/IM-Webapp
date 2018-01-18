/**
 * 改进：合计行 去掉 cell tool 图标
 */
Ext.define(null, {
    override: 'Ext.grid.SummaryRow',

    privates: {

        createCell(column) {

            var cell = column.createCell(this);
            delete cell.tools;

            cell = Ext.create(cell);
            delete cell.$initParent;

            if (cell.inheritUi) {
                cell.doInheritUi();
            }

            cell.el.setTabIndex(-1);

            return cell;
        }
    }
});