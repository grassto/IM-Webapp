
Ext.define('UX.data.proxy.Sql', {
    alias: 'proxy.ux_sql',
    extend: 'Ext.data.proxy.Client',

    isSQLProxy: true,

    config: {
        /**
        * @cfg {Object} reader
        * @hide
        */
        reader: null,
        /**
        * @cfg {Object} writer
        * @hide
        */
        writer: null,
        /**
        * @cfg {String} table
        * Optional Table name to use if not provided ModelName will be used
        */
        table: null,
        /**
        * @cfg {String} database
        * Database name to access tables from
        */
        database: 'Sencha',

        columns: '',

        uniqueIdStrategy: false,

        tableExists: false,

        defaultDateFormat: 'Y-m-d H:i:s.u',

        filterStatement: null
    },

    updateModel: function(model) {
        if (model) {
            var modelName = model.modelName,
                defaultDateFormat = this.getDefaultDateFormat(),
                table = modelName.slice(modelName.lastIndexOf('.') + 1);

            model.getFields().each(function(field) {
                if (field.getType().type === 'date' && !field.getDateFormat()) {
                    field.setDateFormat(defaultDateFormat);
                }
            });

            this.setUniqueIdStrategy(model.getIdentifier().isUnique);
            if (!this.getTable()) {
                this.setTable(table);
            }
            this.setColumns(this.getPersistedModelColumns(model));
        }

        this.callParent(arguments);
    },

    setException: function(operation, error) {
        operation.setException(error);
    },

    create: function(operation, callback, scope) {
        var me = this,
            db = me.getDatabaseObject(),
            records = operation.getRecords(),
            tableExists = me.getTableExists();

        operation.setStarted();

        db.transaction(function(transaction) {
            if (!tableExists) {
                me.createTable(transaction);
            }

            me.insertRecords(records, transaction, function(resultSet, error) {
                if (operation.process(operation.getAction(), resultSet) === false) {
                    me.fireEvent('exception', me, operation);
                }

                if (error) {
                    operation.setException(error);
                }
            }, me);
        },
            function(transaction, error) {
                me.setException(operation, error);
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            },
            function(transaction) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            }
        );
    },

    read: function(operation, callback, scope) {
        var me = this,
            db = me.getDatabaseObject(),
            model = me.getModel(),
            idProperty = model.getIdProperty(),
            tableExists = me.getTableExists(),
            params = operation.getParams() || {},
            id = params[idProperty],
            sorters = operation.getSorters(),
            filters = operation.getFilters(),
            page = operation.getPage(),
            start = operation.getStart(),
            limit = operation.getLimit(),
            filtered, i, ln;

        params = Ext.apply(params, {
            page: page,
            start: start,
            limit: limit,
            sorters: sorters,
            filters: filters
        });

        operation.setStarted();

        db.transaction(function(transaction) {
            if (!tableExists) {
                me.createTable(transaction);
            }

            me.selectRecords(transaction, id !== undefined ? id : params, function(resultSet, error) {
                if (operation.process(operation.getAction(), resultSet) === false) {
                    me.fireEvent('exception', me, operation);
                }

                if (error) {
                    operation.setException(error);
                }
            });
        },
            function(transaction, error) {
                me.setException(operation, error);
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            },
            function(transaction) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            }
        );
    },

    update: function(operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            db = me.getDatabaseObject(),
            tableExists = me.getTableExists();

        operation.setStarted();

        db.transaction(function(transaction) {
            if (!tableExists) {
                me.createTable(transaction);
            }

            me.updateRecords(transaction, records, function(resultSet, errors) {
                if (operation.process(operation.getAction(), resultSet) === false) {
                    me.fireEvent('exception', me, operation);
                }

                if (errors) {
                    operation.setException(errors);
                }
            });
        },
            function(transaction, error) {
                me.setException(operation, error);
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            },
            function(transaction) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            }
        );
    },

    destroy: function(operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            db = me.getDatabaseObject(),
            tableExists = me.getTableExists();

        operation.setStarted();

        db.transaction(function(transaction) {
            if (!tableExists) {
                me.createTable(transaction);
            }

            me.destroyRecords(transaction, records, function(resultSet, error) {
                if (operation.process(operation.getAction(), resultSet) === false) {
                    me.fireEvent('exception', me, operation);
                }

                if (error) {
                    operation.setException(error);
                }
            });
        },
            function(transaction, error) {
                me.setException(operation, error);
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            },
            function(transaction) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, operation);
                }
            }
        );
    },

    createTable: function(transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS ' + this.getTable() + ' (' + this.getSchemaString() + ')');
        this.setTableExists(true);
    },

    insertRecords: function(records, transaction, callback, scope) {
        var me = this,
            table = me.getTable(),
            columns = me.getColumns(),
            totalRecords = records.length,
            executed = 0,
            tmp = [],
            insertedRecords = [],
            errors = [],
            uniqueIdStrategy = me.getUniqueIdStrategy(),
            i, ln, placeholders, result;

        result = new Ext.data.ResultSet({
            records: insertedRecords,
            success: true
        });

        for (i = 0, ln = columns.length; i < ln; i++) {
            tmp.push('?');
        }
        placeholders = tmp.join(', ');

        Ext.each(records, function(record) {
            var id = record.getId(),
                data = me.getRecordData(record),
                values = me.getColumnValues(columns, data);

            transaction.executeSql(
                'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + placeholders + ')', values,
                function(transaction, resultSet) {

                    // FIX TO DECODE ARRAY/OBJECT FIELDS
                    data = me.decodeRecordData(data);

                    executed++;

                    insertedRecords.push({
                        clientId: id,
                        id: uniqueIdStrategy ? id : resultSet.insertId,
                        data: data,
                        node: data
                    });

                    if (executed === totalRecords && typeof callback == 'function') {
                        callback.call(scope || me, result, errors.length > 0 ? errors : null);
                    }
                },
                function(transaction, error) {
                    executed++;
                    errors.push({
                        clientId: id,
                        error: error
                    });

                    if (executed === totalRecords && typeof callback == 'function') {
                        callback.call(scope || me, result, errors);
                    }
                }
            );
        });
    },

    selectRecords: function(transaction, params, callback, scope) {
        var me = this,
            table = me.getTable(),
            idProperty = me.getModel().getIdProperty(),
            sql = 'SELECT * FROM ' + table,
			sqlTotal = 'SELECT Count(1) AS TotalCount FROM ' + table,
            records = [],
            fs = me.getFilterStatement(),
            filterStatement = ' WHERE ',
            sortStatement = ' ORDER BY ',
            i, ln, data, result, count, rows, filter, sorter, property, value;

        result = new Ext.data.ResultSet({
            records: records,
            success: true
        });

        if (!Ext.isEmpty(fs)) {
            sql += filterStatement + fs;
            sqlTotal += filterStatement + fs;
            filterStatement = ' AND ';
        }

        if (!Ext.isObject(params)) {
            sql += filterStatement + idProperty + ' = \'' + params + '\'';
            sqlTotal += filterStatement + idProperty + ' = \'' + params + '\'';
        } else {
            ln = params.filters && params.filters.length;
            if (ln) {
                for (i = 0; i < ln; i++) {
                    filter = params.filters[i];
                    property = filter.getProperty();
                    value = filter.getValue();
                    if (property !== null) {
                        sql += filterStatement + property + ' ' + (filter.getAnyMatch() ? ('LIKE \'%' + value + '%\'') : ('= \'' + value + '\''));
                        sqlTotal += filterStatement + property + ' ' + (filter.getAnyMatch() ? ('LIKE \'%' + value + '%\'') : ('= \'' + value + '\''));
                        filterStatement = ' AND ';
                    }
                }
            }

            ln = params.sorters && params.sorters.length;
            if (ln) {
                for (i = 0; i < ln; i++) {
                    sorter = params.sorters[i];
                    property = sorter.getProperty();
                    if (property !== null) {
                        sql += sortStatement + property + ' ' + sorter.getDirection();
                        sqlTotal += sortStatement + property + ' ' + sorter.getDirection();
                        sortStatement = ', ';
                    }
                }
            }

            // handle start, limit, sort, filter and group params
            if (params.page !== undefined) {
                sql += ' LIMIT ' + parseInt(params.start, 10) + ', ' + parseInt(params.limit, 10);
            }
        }

        var _recordsquery = false, _totalcountquery = false, recordCount = 0;

        if (params.page !== undefined) { //paging
            transaction.executeSql(sqlTotal, null, function(tx, results) {
                recordCount = results.rows.item(0).TotalCount;
                _totalcountquery = true;

                if (_recordsquery && _totalcountquery) {
                    result.setSuccess(true);
                    result.setTotal(recordCount);
                    result.setCount(count);

                    if (typeof callback == 'function') {
                        callback.call(scope || me, result);
                    }
                }
            });
        }


        transaction.executeSql(sql, null,
            function(transaction, resultSet) {
                rows = resultSet.rows;
                count = rows.length;

                for (i = 0, ln = count; i < ln; i++) {

                    // FIX TO DECODE ARRAY/OBJECT FIELDS
                    data = me.decodeRecordData(rows.item(i));

                    records.push({
                        clientId: null,
                        id: data[idProperty],
                        data: data,
                        node: data
                    });
                }
                _recordsquery = true;

                if (params.page !== undefined) { //paging
                    if (_recordsquery && _totalcountquery) {
                        result.setSuccess(true);
                        result.setTotal(recordCount);
                        result.setCount(count);

                        if (typeof callback == 'function') {
                            callback.call(scope || me, result);
                        }
                    }
                }
                else {
                    result.setSuccess(true);
                    result.setTotal(count);
                    result.setCount(count);

                    if (typeof callback == 'function') {
                        callback.call(scope || me, result);
                    }
                }
            },
            function(transaction, errors) {
                result.setSuccess(false);
                result.setTotal(0);
                result.setCount(0);

                if (typeof callback == 'function') {
                    callback.call(scope || me, result);
                }
            }
        );
    },

    updateRecords: function(transaction, records, callback, scope) {
        var me = this,
            table = me.getTable(),
            columns = me.getColumns(),
            totalRecords = records.length,
            idProperty = me.getModel().getIdProperty(),
            executed = 0,
            updatedRecords = [],
            errors = [],
            i, ln, result;

        result = new Ext.data.ResultSet({
            records: updatedRecords,
            success: true
        });

        Ext.each(records, function(record) {
            var id = record.getId(),
                data = me.getRecordData(record),
                values = me.getColumnValues(columns, data),
                updates = [];

            for (i = 0, ln = columns.length; i < ln; i++) {
                updates.push(columns[i] + ' = ?');
            }

            transaction.executeSql(
                'UPDATE ' + table + ' SET ' + updates.join(', ') + ' WHERE ' + idProperty + ' = ?', values.concat(id),
                function(transaction, resultSet) {
                    executed++;

                    // FIX TO DECODE ARRAY/OBJECT FIELDS
                    data = me.decodeRecordData(data);

                    updatedRecords.push({
                        clientId: id,
                        id: id,
                        data: data,
                        node: data
                    });

                    if (executed === totalRecords && typeof callback == 'function') {
                        callback.call(scope || me, result, errors.length > 0 ? errors : null);
                    }
                },
                function(transaction, error) {
                    executed++;
                    errors.push({
                        clientId: id,
                        error: error
                    });

                    if (executed === totalRecords && typeof callback == 'function') {
                        callback.call(scope || me, result, errors);
                    }
                }
            );
        });
    },


    decodeRecordData: function(data) {

        var key, newData = {}, fields = this.getModel().getFields().items, fieldTypes = {};
        Ext.each(fields, function(field) {
            fieldTypes[field.getName()] = field.config.type;
        });

        for (key in data) {
            if (Ext.isDefined(fieldTypes[key]) && (fieldTypes[key] == 'object' || fieldTypes[key] == 'array')) {
                if (Ext.isEmpty(data[key])) {
                    newData[key] = null;
                } else {
                    newData[key] = Ext.decode(data[key]);
                }
            } else {
                newData[key] = data[key];
            }
        }

        return newData;
    },

    destroyRecords: function(transaction, records, callback, scope) {
        var me = this,
            table = me.getTable(),
            idProperty = me.getModel().getIdProperty(),
            ids = [],
            values = [],
            destroyedRecords = [],
            i, ln, result, record;

        for (i = 0, ln = records.length; i < ln; i++) {
            ids.push(idProperty + ' = ?');
            values.push(records[i].getId());
        }

        result = new Ext.data.ResultSet({
            records: destroyedRecords,
            success: true
        });

        transaction.executeSql(
            'DELETE FROM ' + table + ' WHERE ' + ids.join(' OR '), values,
            function(transaction, resultSet) {
                for (i = 0, ln = records.length; i < ln; i++) {
                    record = records[i];
                    destroyedRecords.push({
                        id: record.getId()
                    });
                }

                if (typeof callback == 'function') {
                    callback.call(scope || me, result);
                }
            },
            function(transaction, error) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, result, error);
                }
            }
        );
    },

    /**
    * Formats the data for each record before sending it to the server. This
    * method should be overridden to format the data in a way that differs from the default.
    * @param {Object} record The record that we are writing to the server.
    * @return {Object} An object literal of name/value keys to be written to the server.
    * By default this method returns the data property on the record.
    */
    getRecordData: function(record) {
        var me = this,
            fields = record.getFields(),
            idProperty = record.getIdProperty(),
            uniqueIdStrategy = me.getUniqueIdStrategy(),
            data = {},
            name, value, newValue;

        fields.each(function(field) {
            if (field.getPersist()) {
                name = field.getName();
                if (name === idProperty && !uniqueIdStrategy) {
                    return;
                }
                value = record.get(name);
                if (field.getType().type == 'date') {
                    newValue = me.writeDate(field, value);
                }
                else if (!Ext.isDefined(value)) {
                    newValue = "";
                }
                else if (field.getType().type == 'auto' && (Ext.isObject(value) || Ext.isArray(value))) {
                    if (Ext.isEmpty(value)) {
                        newValue = "";
                    } else {
                        newValue = Ext.encode(value);
                    }
                } else {
                    newValue = value;
                }
                data[name] = newValue;
            }
        }, this);

        return data;
    },

    getColumnValues: function(columns, data) {
        var ln = columns.length,
            values = [],
            i, column, value;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            value = data[column];
            if (value !== undefined) {
                values.push(value);
            }
        }

        return values;
    },

    getSchemaString: function() {
        var me = this,
            schema = [],
            model = me.getModel(),
            idProperty = model.getIdProperty(),
            fields = model.getFields().items,
            uniqueIdStrategy = me.getUniqueIdStrategy(),
            ln = fields.length,
            i, field, type, name, persist;

        for (i = 0; i < ln; i++) {
            field = fields[i];
            type = field.getType().type;
            name = field.getName();
            persist = field.getPersist();
            if (!persist) {
                continue;
            }

            if (name === idProperty) {
                if (uniqueIdStrategy) {
                    type = me.convertToSqlType(type);
                    schema.unshift(idProperty + ' ' + type + ' PRIMARY KEY');
                } else {
                    schema.unshift(idProperty + ' INTEGER PRIMARY KEY AUTOINCREMENT');
                }
            } else {
                type = me.convertToSqlType(type);
                schema.push(name + ' ' + type);
            }
        }

        return schema.join(', ');
    },

    getPersistedModelColumns: function(model) {
        var fields = model.getFields().items,
            uniqueIdStrategy = this.getUniqueIdStrategy(),
            idProperty = model.getIdProperty(),
            columns = [],
            ln = fields.length,
            i, field, name;

        for (i = 0; i < ln; i++) {
            field = fields[i];
            name = field.getName();

            if (name === idProperty && !uniqueIdStrategy) {
                continue;
            }

            if (field.getPersist()) {
                columns.push(field.getName());
            }
        }
        return columns;
    },

    convertToSqlType: function(type) {
        switch (type.toLowerCase()) {
            case 'date':
            case 'string':
            case 'array':
            case 'object':
            case 'auto':
                return 'TEXT';
            case 'int':
                return 'INTEGER';
            case 'float':
                return 'REAL';
            case 'bool':
                return 'NUMERIC';
        }
    },

    writeDate: function(field, date) {
        if (Ext.isEmpty(date)) {
            return null;
        }

        var dateFormat = field.getDateFormat() || this.getDefaultDateFormat();
        switch (dateFormat) {
            case 'timestamp':
                return date.getTime() / 1000;
            case 'time':
                return date.getTime();
            default:
                return Ext.Date.format(date, dateFormat);
        }
    },

    dropTable: function(config) {
        var me = this,
            table = me.getTable(),
            callback = config ? config.callback : null,
            scope = config ? config.scope || me : null,
            db = me.getDatabaseObject();

        db.transaction(function(transaction) {
                transaction.executeSql('DROP TABLE ' + table);
            },
            function(transaction, error) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, false, table, error);
                }
            },
            function(transaction) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, true, table);
                }
            }
        );

        me.setTableExists(false);
    },

    clear: function() {
        var me = this,
            table = me.getTable(),
            db = me.getDatabaseObject();

        db.transaction(function(transaction) {
                transaction.executeSql(['delete from ' + table + ';',
                    'update sqlite_sequence set seq=0 where name=' + table + ';'
                ].join(''));
            },
            function(transaction, error) {
                
            },
            function(transaction) {
                
            }
        );
    },

    getDatabaseObject: function() {
        if (Ext.browser.is.Cordova || window.cefMain) {
            return sqlitePlugin.openDatabase({
                // name: this.getDatabase(), 不知道为啥找不到
                name: 'Sencha',
                iosDatabaseLocation: 'default'
            });
        }
        return openDatabase(this.getDatabase(), '1.0', 'Sencha Database', 5 * 1024 * 1024);
    }
});
