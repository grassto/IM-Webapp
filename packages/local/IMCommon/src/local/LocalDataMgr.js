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

    testCon() {
        var me = this;
        me.getDB().transaction(function(trans) {
            me.enSureUserTable(trans);
        });
    },
    // 获取database对象
    getDB: function() {
        if (Ext.browser.is.Cordova || window.cefMain) {
            return sqlitePlugin.openDatabase({
                name: 'IM',
                iosDatabaseLocation: 'default'
            });
        }
        // return openDatabase('IM', '1.0', 'IM Database', 5 * 1024 * 1024); // 浏览器WebSQL
    },

    enSureUserTable(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS User (UserID TEXT PRIMARY KEY NOT NULL, UserName TEXT, Mobile TEXT, Email TEXT, Sex TEXT, Age INT, Notes TEXT, DefRolID TEXT, IsSupperUser BOOLEAN, IsClose BOOLEAN)';
        transaction.executeSql(sql, null, function(trans, resultSet) {
            console.log('建表成功User');
            //sql执行成功
        }, function(trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    /**
     * 确保Chat表存在
     * @param  {[Object]} transaction sql事务
     */
    ensureChatTable: function(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS Chat (ChatID TEXT PRIMARY KEY NOT NULL, DisplayName TEXT, ChatType TEXT, UnreadCount INT, LastPostAt BIGINT, LastUserID TEXT, LastMsg TEXT, IsTop BOOLEAN, AtCount INT)';
        transaction.executeSql(sql, null, function(trans, resultSet) {
            console.log('建表成功Chat');
            //sql执行成功
        }, function(trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    /**
     * 确保ChatRoom表存在
     * @param  {[Object]} transaction sql事务
     */
    ensureChatRoomTable: function(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS ChatRoom (ChatID TEXT PRIMARY KEY NOT NULL, MgrID TEXT, MgrName TEXT, CreatorID TEXT, CreatorName TEXT, UserIDs TEXT)';
        transaction.executeSql(sql, null, function(trans, resultSet) {
            console.log('建表成功ChatRoom');
            //sql执行成功
        }, function(trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    ensureMessageTable: function(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS Message (MsgID TEXT, ChatID TEXT, MsgType TEXT, Content TEXT, FilePath TEXT, CreateAt BIGINT, SenderID TEXT, SenderName TEXT, MsgSeq INT, IsSuccess BOOLEAN, FileType TEXT, FileName TEXT, FileSize BIGINT)';
        transaction.executeSql(sql, null, function(trans, resultSet) {
            console.log('建表成功Message');
            //sql执行成功
        }, function(trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },


    /* ********************************************** 读 *********************************************/

    getOwnInfo(ownID, success) {
        var me = this;
        me.getDB().transaction(function(trans) {
            me.enSureUserTable(trans);

            var sql = 'select * from User where userID = ?';
            trans.executeSql(sql, [ownID], function(trans, resultSet) {
                success(trans, resultSet);
            });
        });
    },

    /**
     * 从本地获取最近会话
     */
    getRecentChat(success) {
        var me = this;
        me.getDB().transaction(function(trans) {
            me.enSureUserTable(trans);

            var sql = 'select * from Chat';
            trans.executeSql(sql, null, function(trans, resultSet) {
                success(trans, resultSet);
            });
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
        for(var i = 0; i < data.length; i++) {
            if (data[i].chat.unread_count > 0) { // 有，更新数据库数据
                // 拼接sql语句
            }
        }
    },


    updateOneChat(data) {
        // 连接SQLite进行数据更新
    }
});