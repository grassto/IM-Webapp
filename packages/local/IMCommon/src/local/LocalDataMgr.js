/**
 * 处理和本地SQLite相关的连接与数据处理
 */
Ext.define('IMCommon.local.LocalDataMgr', {
    alternateClassName: 'LocalDataMgr',
    singleton: true,

    requires: [
        'UX.data.proxy.Sql'
    ],

    //获取database对象
    getDB: function() {
        return UX.data.proxy.Sql.prototype.getDatabaseObject();
    },
    /**
     * 确保Chat表存在
     * @param  {[Object]} transaction sql事务
     */
    ensureTable: function(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS Chat (ChatID TEXT PRIMARY KEY, ChatName TEXT, ChatType TEXT, ChatUnread TEXT, LastPostAt BIGINT, lastMsg TEXT, isTop INT)';
        transaction.executeSql(sql, null, function(trans, resultSet) {
            console.log('建表成功');
            //sql执行成功
        }, function(trans, error) {
            //sql执行失败
            Ext.Msg.alert('提示', '建表出错');
        });
    },

    testCon() {
        var me = this;
        me.getDB().transaction(function(trans) {
            me.ensureTable(trans);
        });
    },


    /**
     * 从本地获取最近会话
     */
    getRecentChat() {
        return LocalTestData.recentChatData;
    },

    /**
     * 获取历史记录
     */
    getHistory() {
        return LocalTestData.history;
    },

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