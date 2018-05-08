Ext.define('IMCommon.local.InitDb', {
    alternateClassName: 'InitDb',
    singleton: true,

    isOK: false,
    ensureInit(callback) {
        if (this.isOK) return true;

        this.initDB(callback);
    },

    // callback:数据库创建完毕后调用，防止表未创建成功，即执行查询
    initDB: function (callback) {
        var me = this;

        var db = LocalDataMgr.getDB();
        db.executeSql('SELECT * FROM IMAdm', [], function (data) {
            if (data.rows.length == 0) {
                me.execSQL(db, '0.0', callback);
            } else {
                var v = data.rows.items(0).Version;
                me.execSQL(db, v, callback);
            }

        }, function (err) {
            me.execSQL(db, '0.0', callback);
        });
    },

    execSQL: function (db, dbVer, callback) {
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
            var sqls = '';
            for (var i = 0; i < sqlArray.length; i++) {
                sqls += sqlArray[i];
            }
            tx.executeSql(sqls, null, function (tx) {
                console.log('ok!');
    
                InitDb.isOK = true;
                callback(tx); // 语句执行成功后调用
            }, function (tx, error) {
                console.log('Transaction ERROR: ' + error.message);
            });
        });
    },

    getUpdateVer: function (dbVer) {
        var upSql = 'UPDATE IMAdm SET Version = \'' + dbVer + '\';';
        return upSql;
    },

    getV1_0: function () {

        var t0 = 'CREATE TABLE IF NOT EXISTS IMAdm (' +
            'ID INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'Version NVARCHAR(20));';

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
            'Status CHAR(1) );';

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
            'AtCount INTEGER );';

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
            'UserIDs TEXT,' +
            'UserNames TEXT );';

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
            'FileSize BIGINT );';

        var t5 = 'CREATE TABLE IF NOT EXISTS IMUsr (' +
            'UserID NVARCHAR(20) PRIMARY KEY,' +
            'UserName NVARCHAR(30),' +
            'Email NVARCHAR(100),' +
            'Sex CHAR(1),' +
            'Age INT,' +
            'Phone NVARCHAR(100),' +
            'Mobile NVARCHAR(100),' +
            'Notes NVARCHAR(200),' +
            'CustomMark NVARCHAR(200),' +
            'DefRolID NVARCHAR(40),' +
            'Locale NVARCHAR(5),' +
            'IsSupperUser CHAR(1),' +
            'IsClose CHAR(1) );';

        var t6 = 'CREATE TABLE IF NOT EXISTS IMUsrRl (' +
            'RoleID NVARCHAR(40) NOT NULL,' +
            'UserID NVARCHAR(20) NOT NULL,' +
            'IsClose CHAR(1) DEFAULT(\'N\') );';

        var t7 = 'CREATE TABLE IF NOT EXISTS IMRol (' +
            'RoleID NVARCHAR(40) NOT NULL,' +
            'RoleName NVARCHAR(40) NOT NULL,' +
            'OrgID NVARCHAR(40),' +
            'Remarks NVARCHAR(200),' +
            'IsClose CHAR(1) DEFAULT(\'N\'),' +
            'IsMaster CHAR(1) );';

        var t8 = 'CREATE TABLE IF NOT EXISTS IMOrg (' +
            'OrgID NVARCHAR(40) PRIMARY KEY,' +
            'OrgName NVARCHAR(40),' +
            'ParentID NVARCHAR(40),' +
            'Remarks NVARCHAR(200),' +
            'IsClose CHAR(1) DEFAULT(\'N\') );';

        return [t0, t1, t2, t3, t4, t5, t6, t7, t8];
    },

    getV2_0: function () {

    },

    updateVer: function (ver) {
        var updateSql = 'UPDATE IMAdm SET Version = ?';
        var db = LocalDataMgr.getDB();
        db.transaction(function (tx) {
            tx.executeSql(updateSql, [ver], function () {
                console.log('success')
            }, function (tx, error) {
                console.log('UPDATE error: ' + error.message)
            });
        });
    }
});