Ext.define('IMCommon.local.InitDb', {
    alternateClassName: 'InitDb',
    singleton: true,

    initDB: function () {
        var me = this;

        var db = LocalDataMgr.getDB();
        db.executeSql('SELECT * FROM IMAdm', [], function (data) {
            if (data.rows.length == 0) {
                me.execSQL(db, '0.0');
            } else {
                var v = data.rows.items(0).Version;
                me.execSQL(db, v);
            }

        }, function (err) {
            me.execSQL(db, '0.0');
        });
    },

    execSQL: function (db, dbVer) {
        var me = this;

        var sqlArray = [];
        switch (dbVer) {
            case '0.0':
                sqlArray = sqlArray.concat(me.getV1_0());
                // case '2.0':
                //     sqlArray.concat(getV2_0());
                break;
            default:
                break;
        }
        sqlArray.push(me.getUpdateVer('1.0'));

        db.transaction(function (tx) {
            for (var i = 0; i < sqlArray.length; i++) {
                tx.executeSql(sqlArray[i]);
            }
        }, function (error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function () {
            console.log('ok!');
        });
    },

    getUpdateVer: function (dbVer) {
        var upSql = 'UPDATE IMAdm SET Version = \'' + dbVer + '\'';
        return upSql;
    },

    getV1_0: function () {

        var t0 = 'CREATE TABLE IF NOT EXISTS IMAdm (' +
            'ID INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'Version NVARCHAR(20))';

        var t1 = 'CREATE TABLE IF NOT EXISTS IMMsg (' +
            'ID INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'MsgID NVARCHAR(50), ' +
            'ChatID NVARCHAR(50), ' +
            'MsgType CHAR(1), ' +
            'Content TEXT, ' +
            'FilePath TEXT, ' +
            'CreateAt BIGINT,' +
            'SenderID NVARCHAR(20), ' +
            'SenderName NVARCHAR(30), ' +
            'MsgSeq BIGINT, ' +
            'Status CHAR(1) )';

        var t2 = 'CREATE TABLE IF NOT EXISTS IMRct (' +
            'ChatID NVARCHAR(50) PRIMARY KEY, ' +
            'ChatType CHAR(1), ' +
            'DisplayName TEXT, ' +
            'UnreadCount INTEGER DEFAULT(0), ' +
            'LastPostAt BIGINT, ' +
            'LastUserID NVARCHAR(20), ' +
            'LastUserName NVARCHAR(30), ' +
            'LastMessage TEXT, ' +
            'LastMsgType CHAR(1), ' +
            'IsTop CHAR(1), ' +
            'AtCount INTEGER )';

        var t3 = 'CREATE TABLE IF NOT EXISTS IMChat (' +
            'ChatID NVARCHAR(50) PRIMARY KEY, ' +
            'DisplayName TEXT, ' +
            'CreatorID NVARCHAR(20), ' +
            'CreatorName NVARCHAR(30), ' +
            'ManagerID NVARCHAR(20), ' +
            'ManagerName NVARCHAR(30), ' +
            'Status CHAR(1), ' +
            'CreateAt BIGINT, ' +
            'Remarks TEXT, ' +
            'UserIDs TEXT )';

        var t4 = 'CREATE TABLE IF NOT EXISTS IMFile (' +
            'ID INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'MsgID NVARCHAR(50), ' +
            'ChatID NVARCHAR(50), ' +
            'FilePath TEXT, ' +
            'FileType CHAR(1), ' +
            'FileName NVARCHAR(255), ' +
            'MimeType NVARCHAR(100), ' +
            'Width INT, ' +
            'Height INT, ' +
            'FileSize BIGINT )';

        return [t0, t1, t2, t3, t4];
    },

    getV2_0: function () {

    },

    updateVer: function (ver) {
        var updateSql = 'UPDATE IMAdm SET Version = ?';
        var db = LocalDataMgr.getDB();
        db.transaction(function (tx) {
            tx.executeSql(updateSql, [ver]);
        }, function () {
            console.log('success')
        }, function (tx, error) {
            console.log('UPDATE error: ' + error.message)
        });
    }
});