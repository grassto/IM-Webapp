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
            if (success) {
                success(trans, resultSet);
            }
        }, function (a, b) {
            alert('出错了', a, b);
        });
    },


    // User
    enSureUserTable(transaction) {
        var sql = 'CREATE TABLE IF NOT EXISTS User (UserID TEXT PRIMARY KEY NOT NULL, UserName TEXT, Mobile TEXT, Email TEXT, Sex TEXT, Age INT, Notes TEXT, DefRolID TEXT, IsSuperUser BOOLEAN, IsClose BOOLEAN)';
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
        var sql = 'CREATE TABLE IF NOT EXISTS IMRct (ChatID TEXT PRIMARY KEY NOT NULL, DisplayName TEXT, ChatType VARCHAR(1), UnreadCount INT, LastPostAt BIGINT, LastUserID NVARCHAR(50), LastUserName TEXT, LastMsgType VARCHAR(1), LastMessage TEXT, IsTop VARCHAR(1), AtCount INT)';
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
        var sql = 'CREATE TABLE IF NOT EXISTS IMChat (' +
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
        // var sql = 'CREATE TABLE IF NOT EXISTS IMChatRoom (ChatID TEXT PRIMARY KEY NOT NULL, MgrID TEXT, MgrName TEXT, CreatorID TEXT, CreatorName TEXT, UserIDs TEXT, DisplayName TEXT)';
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
        var sql = 'CREATE TABLE IF NOT EXISTS IMMsg (' +
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
        // var sql = 'CREATE TABLE IF NOT EXISTS IMMessage (ID INTEGER PRIMARY KEY AUTOINCREMENT, MsgID NVARCHAR(50), ChatID NVARCHAR(50), MsgType VARCHAR(1), Content TEXT, FilePath TEXT, CreateAt BIGINT, SenderID NVARCHAR(50), SenderName TEXT, MsgSeq BIGINT, Status VARCHAR(1))';
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
        var sql = 'CREATE TABLE IF NOT EXISTS IMFile (' +
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
        // var sql = 'CREATE TABLE IF NOT EXISTS IMFile (ID INTEGER PRIMARY KEY AUTOINCREMENT, MsgID NVARCHAR(50), ChatID NVARCHAR(50), FilePath TEXT, FileType VARCHAR(1), FileName TEXT, FileSize BIGINT)';
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
     * 分页获取历史记录
     */
    getHistory(success, pageFrom) {
        var me = this;
        me.getDB().transaction(function (trans) {
            me.ensureMessageTable(trans);
            var sql = 'select *from IMMessage limit ' + pageFrom + ',20';
        });
    },

    // 本地查出最后一条消息的时间
    getLastMsgTime(chatID, success) {
        var result = 0;
        var sql = 'select CreateAt from IMMessage where ChatID="' + chatID + '" order by CreateAt desc limit 0,1';
        this.getDB().executeSql(sql, null, function (resultSet) {
            success(resultSet);
        });

        return result;
    },

    /* ********************************************** 写 *********************************************/

    /**
     * 更新最近会话
     * @param {Array} data 获取到的最新的最近会话数据
     */
    initUpdateChats(data) {
        var me = this,
            sqls = '',
            sql = '';

        me.getDB().transaction(function (trans) {
            me.ensureRChatTable(trans);

            for (var i = 0; i < data.length; i++) {
                data[i].chat.last_sender_name = ConnectHelper.parseDirectChatName(data[i]);
                // data[i].chat.last_sender_name = ChatHelper.getName(data[i].chat.last_sender);
                // 这边先只用字符串的形式
                sql = 'INSERT OR REPLACE INTO IMRct (ChatID, DisplayName, ChatType, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage, LastMsgType) VALUES ("' + data[i].chat.chat_id + '","' + data[i].chat.channelname + '","' + data[i].chat.chat_type + '",' + data[i].chat.unread_count + ',' + data[i].chat.last_post_at + ',"' + data[i].chat.last_sender + '","' + data[i].chat.last_sender_name + '","' + data[i].chat.last_message + '","' + data[i].chat.last_msg_type + '");';
                sqls += sql;
            }

            me.handleSql(trans, sqls);
        });
    },

    /**
     * 自己将从服务端获取到的数据处理一下
     * @param {json} data 需要更新的数据
     * {chat:{},members:{}}
     */
    updateRctChat(data) {
        // var sqls = [],
        //     sql = '';
        // for (var i = 0; i < data.length; i++) {
        //     // 这边先只用字符串的形式
        //     sql = ['INSERT OR REPLACE INTO IMRct (ChatID, DisplayName, ChatType, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage) VALUES (' + data[i].chat.chat_id + ',' + data[i].chat.channelname + ',' + data[i].chat.chat_type + ',' + data[i].chat.unread_count + ',' + data[i].chat.last_post_at + ',"","","");'];
        //     sqls.push(sql);
        // }

        // this.getDB().sqlBatch(sqls, function () {
        //     console.log('最近会话同步成功');
        // }, function (err) {
        //     console.log('最近会话同步失败', err);
        // });

        var me = this,
            sqls = '',
            sql = '';

        me.getDB().transaction(function (trans) {
            me.ensureRChatTable(trans);

            for (var i = 0; i < data.length; i++) {
                // 这边先只用字符串的形式
                sql = 'INSERT OR REPLACE INTO IMRct (ChatID, DisplayName, ChatType, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage) VALUES ("' + data[i].chat.chat_id + '","' + data[i].chat.channelname + '","' + data[i].chat.chat_type + '",' + data[i].chat.unread_count + ',' + data[i].chat.last_post_at + ',"' + data[i].chat.last_sender + '","' + data[i].chat.last_sender_name + '","' + data[i].chat.last_message + '");';
                sqls += sql;
            }

            me.handleSql(trans, sqls);
        });
    },

    /**
     * 自己新建会话
     * @param {json} data ({chat_id:xxx,chat_name:xxx,...})
     */
    meAddRctChat(data) {
        var me = this;
        me.getDB().transaction(function (trans) {
            me.ensureRChatTable(trans);

            var sql = 'INSERT INTO IMRct (ChatID, DisplayName, ChatType, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage) VALUES ("' + data.chat_id + '","' + data.display_name + '","' + data.chat_type + '",' + data.unread_count + ',' + data.last_post_at + ',"' + data.last_sender + '","' + data.last_sender_name + '","' + data.last_message + '");';
            me.handleSql(trans, sql);
        });
    },

    // ws请求过来后，更新最近会话
    updateRctByWS(data) {
        const me = this;

        me.getDB().transaction(function (trans) {
            var sql = 'UPDATE IMRct SET UnreadCount=UnreadCount+1,LastPostAt=' + data.create_at + ',LastUserID="' + data.user_id + '",LastUserName="' + data.user_name + '",LastMessage="' + data.message + '"';

            me.handleSql(trans, sql);
        });
    },

    insertRctByWS(data) {
        const me = this;

        me.getDB().transaction(function (trans) {
            var sql = 'INSERT INTO IMRct (ChatID, ChatType, DisplayName, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage, LastMsgType, IsTop, AtCount) VALUES ("' + data.chat_id + '","' + data.chat_type + '","' + data.chat_name + '",0,' + data.create_at + ',"' + data.user_id + '","' + data.user_name + '","' + data.message + '","' + data.msg_type + '","",0);';

            me.handleSql(trans, sql);
        });
    },

    /**
     * 初始化插入未读消息
     * @param {json} msgList
     */
    initAddToMsg(msgList) {
        var me = this,
            sqls = '',
            sql = '';

        me.getDB().transaction(function (trans) {
            me.ensureMessageTable(trans);

            var status = '0'; // 成功状态
            var filePath = '',
                userName = '';

            for (var i = 0; i < msgList.length; i++) {
                switch (msgList[i].wrapper_type) {
                    case MsgWrapperType.Message:
                        // filePath = ;
                        // 这边先只用字符串的形式

                        sql = 'INSERT INTO IMMsg (MsgID, ChatID, MsgType, Content, FilePath, CreateAt, SenderID, SenderName, Status) VALUES ("' + msgList[i].message.msg_id + '","' + msgList[i].message.chat_id + '","' + msgList[i].message.msg_type + '","' + msgList[i].message.message + '","' + filePath + '",' + msgList[i].message.create_at + ',"' + msgList[i].message.user_id + '","' + userName + '","' + status + '")';

                        // sql = [
                        //     'INSERT INTO IMMsg (',
                        //     'MsgID',
                        //     'ChatID',
                        //     'MsgType',
                        //     'Content',
                        //     'FilePath',
                        //     'CreateAt',
                        //     'SenderID',
                        //     'SenderName',
                        //     'Status', // 消息状态，标志发送成功与否，这边全标记为成功
                        //     ') VALUES (',
                        //     msgList[i].message.msg_id,
                        //     msgList[i].message.chat_id,
                        //     msgList[i].message.msg_type,
                        //     msgList[i].message.message,
                        //     filePath, // 这个放在外面组织好，然后拿进来
                        //     msgList[i].message.create_at,
                        //     msgList[i].message.user_id,
                        //     userName, // 这个放在外面组织好，然后拿进来
                        //     status,
                        //     ')'
                        // ].join('');
                        sqls += sql;
                        break;
                    case MsgWrapperType.Notice:
                        // 组织一下content
                        break;
                    default:
                        break;
                }


            }

            me.handleSql(trans, sqls);
        });
    },

    /**
     * 将数据组织成json，直接发过来保存本地
     * @param {json} data
     */
    meAddOffLineMsg(data) {
        var me = this,
            status = '1'; // 默认失败状态

        var sql = 'INSERT INTO IMMsg (ChatID, MsgType, Content, FilePath, CreateAt, SenderID, SenderName, Status) VALUES ("' + data.chatID + '","' + data.msgType + '","' + data.content + '","' + data.filePath + '",' + data.createAt + ',"' + data.userID + '","' + data.userName + '","' + status + '")';


        me.getDB().transaction(function (trans) {
            me.ensureMessageTable(trans);

            me.handleSql(trans, sql);
        });
    },

    /**
     * 发送成功后，更新本地MSG
     */
    meUpdateLocMsg() {

    },

    /**
     * 接收到websocket信息后，添加消息进入表中
     * @param {json} data
     */
    insertOMsg(data) {
        const me = this;

        me.getDB().transaction(function (trans) {
            me.ensureMessageTable(trans);
            var status = '0'; // 成功态
            var sql = 'INSERT INTO IMMsg (MsgID, ChatID, MsgType, Content, FilePath, CreateAt, SenderID, SenderName, Status) VALUES ("' + data.msg_id + '","' + data.chat_id + '","' + data.msg_type + '","' + data.message + '","' + data.filePath + '",' + data.create_at + ',"' + data.user_id + '","' + data.user_name + '","' + status + '")';

            me.handleSql(trans, sql);
        });
    }
});