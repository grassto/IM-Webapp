/**
 * 处理和本地SQLite相关的连接与数据处理
 */
Ext.define('IMCommon.local.LocalDataMgr', {
    alternateClassName: 'LocalDataMgr',
    singleton: true,

    // requires: [
    //     'UX.data.proxy.Sql'
    // ],

    /* ********************************************** 数据库相关 *********************************************/

    // 使用db.sqlBatch(sqlStatement, success, error) 第一个参数是数组，

    // 获取database对象
    getDB: function () {
        if (Ext.browser.is.Cordova || window.cefMain) {
            return sqlitePlugin.openDatabase({
                name: 'IM',
                iosDatabaseLocation: 'default'
            });
        }
        return openDatabase('IM', '1.0', 'IM Database', 5 * 1024 * 1024); // 浏览器WebSQL
    },

    /**
     * 统一处理sql操作失败
     * @param {*} trans transaction
     * @param {*} sql sql语句
     * @param {*} success 成功回调
     */
    handleSql(trans, sql, success) {
        trans.executeSql(sql, null, function (trans, resultSet) {
            success(trans, resultSet);
        }, function (a, b) {
            alert('出错了', a, b);
        });
    },


    // enSureTable中的transaction都先使用DB来创建，而不使用事务

    enSureUserTable(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS User (UserID TEXT PRIMARY KEY NOT NULL, UserName TEXT, Mobile TEXT, Email TEXT, Sex TEXT, Age INT, Notes TEXT, DefRolID TEXT, IsSupperUser BOOLEAN, IsClose BOOLEAN)';
        transaction.executeSql(sql, null, function (trans, resultSet) {
            console.log('建表成功User');
            //sql执行成功
        }, function (trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    /**
     * 确保IMRct表存在
     * @param  {[Object]} transaction sql事务
     */
    ensureRChatTable: function (transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS IMRct (ChatID TEXT PRIMARY KEY NOT NULL, DisplayName TEXT, ChatType VAARCHAR(1), UnreadCount INT, LastPostAt BIGINT, LastUserID NVARCHAR(50), LastUserName TEXT, LastMsg TEXT, IsTop BOOLEAN, AtCount INT)';
        transaction.executeSql(sql, null, function (trans, resultSet) {
            console.log('建表成功Chat', resultSet);
            //sql执行成功
        }, function (trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    /**
     * 确保IMChatRoom表存在
     * @param  {[Object]} transaction sql事务
     */
    ensureChatRoomTable: function (transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS IMChatRoom (ChatID TEXT PRIMARY KEY NOT NULL, MgrID TEXT, MgrName TEXT, CreatorID TEXT, CreatorName TEXT, UserIDs TEXT, DisplayName TEXT)';
        transaction.executeSql(sql, null, function (trans, resultSet) {
            console.log('建表成功ChatRoom');
            //sql执行成功
        }, function (trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    // IMMessage
    ensureMessageTable: function (transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS IMMessage (ID INTEGER PRIMARY KEY AUTOINCREMENT, MsgID NVARCHAR(50), ChatID NVARCHAR(50), MsgType VARCHAR(1), Content TEXT, FilePath TEXT, CreateAt BIGINT, SenderID NVARCHAR(50), SenderName TEXT, MsgSeq BIGINT, Status VARCHAR(1))';
        transaction.executeSql(sql, null, function (trans, resultSet) {
            console.log('建表成功Message');
            //sql执行成功
        }, function (trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    // IMFile
    ensureFileTable(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS IMFile (ID INTEGER PRIMARY KEY AUTOINCREMENT, MsgID NVARCHAR(50), ChatID NVARCHAR(50), FilePath TEXT, FileType VARCHAR(1), FileName TEXT, FileSize BIGINT)';
        transaction.executeSql(sql, null, function (trans, resultSet) {
            console.log('建表语句成功IMFile');
            //sql执行成功
        }, function (trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错：' + error);
        });
    },


    /* ********************************************** 读 *********************************************/

    // 个人信息先不需要
    getOwnInfo(ownID, success) {
        var me = this;
        me.getDB().transaction(function (trans) {
            me.enSureUserTable(trans);

            var sql = 'select * from User where userID = ?';
            trans.executeSql(sql, [ownID], function (trans, resultSet) {
                success(trans, resultSet);
            });
        });
    },

    /**
     * 从本地获取最近会话
     */
    getRecentChat(success) {
        // var me = this,
        // db = me.getDB();
        // me.ensureRChatTable(db);

        // var sql = 'select * from Chat';
        // me.handleSql(db, sql, success);

        var me = this;
        me.getDB().transaction(function (trans) {
            me.ensureRChatTable(trans);

            var sql = 'select * from IMRct';
            me.handleSql(trans, sql, success);
        });
    },

    // 不要用
    getRLastPostAt(success) {
        var me = this;
        me.getDB().transaction(function (trans) {
            me.ensureRChatTable(trans);

            var sql = 'SELECT TOP 1 LastPostAt FROM IMRct ORDER BY LastPostAt DESC';
            me.handleSql(trans, sql, success);
        });
    },

    /**
     * 获取历史记录
     */
    getHistory() {
        return LocalTestData.history;
    },

    /* ********************************************** 写 *********************************************/

    /**
     * 更新最近会话
     * @param {Array} data 获取到的最新的最近会话数据
     */
    initUpdateChats(data) {
        // 循环遍历是否有存在未读消息的最近回话
        for (var i = 0; i < data.length; i++) {
            if (data[i].chat.unread_count > 0) { // 有，更新数据库数据
                // 拼接sql语句
            }
        }
    },

    /**
     * 自己将从服务端获取到的数据处理一下
     * @param {json} data 需要更新的数据
     * {chat:{},members:{}}
     */
    updateRctChat(data) {
        var sqls = [],
            sql = '';
        for (var i = 0; i < data.length; i++) {
            // 这边先只用字符串的形式
            sql = ['INSERT OR REPLACE INTO IMRct (ChatID, DisplayName, ChatType, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMsg) VALUES (' + data[i].chat.chat_id + ',' + data[i].chat.channelname + ',' + data[i].chat.chat_type + ',' + data[i].chat.unread_count + ',' + data[i].chat.last_post_at + ',"","","");'];
            sqls.push(sql);
        }

        this.getDB().sqlBatch(sqls, function () {
            console.log('最近会话同步成功');
        }, function (err) {
            console.log('最近会话同步失败', err);
        });
    },
});