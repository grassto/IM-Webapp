/**
 * 处理和本地SQLite相关的连接与数据处理
 */
Ext.define('IMCommon.local.LocalDataMgr', {
    alternateClassName: 'LocalDataMgr',
    singleton: true,

    // 26位guid号
    newGuid() {
        var guid = '';
        for (var i = 1; i <= 26; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
        }
        return guid;
    },

    /* ********************************************** 数据库相关 *********************************************/

    // 使用db.sqlBatch(sqlStatement, success, error) 第一个参数是数组，

    // 获取database对象
    getDB: function () {
        if (Ext.browser.is.Cordova || window.cefMain) {
            return sqlitePlugin.openDatabase({
                name: User.ownerID, // 不同的用户根据user_id来创建数据库
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
        }, function (trans, err) {
            // <debug>
            console.log('操作本地数据库出错：', err.message);
            // </debug>
            alert('出错了' + err.message);
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

    // IMMsg
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
        // var sql = 'CREATE TABLE IF NOT EXISTS IMMsg (ID INTEGER PRIMARY KEY AUTOINCREMENT, MsgID NVARCHAR(50), ChatID NVARCHAR(50), MsgType VARCHAR(1), Content TEXT, FilePath TEXT, CreateAt BIGINT, SenderID NVARCHAR(50), SenderName TEXT, MsgSeq BIGINT, Status VARCHAR(1))';
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
            // me.enSureUserTable(trans);

            var sql = 'select * from User where userID = ?';
            trans.executeSql(sql, [ownID], function (trans, resultSet) {
                success(trans, resultSet);
            });
        });
    },

    /**
     * 从本地获取最近会话
     */
    getRecentChat(trans, success) {
        var sql = 'select R.*,C.UserIDs,C.UserNames from IMRct R LEFT JOIN IMChat C ON R.ChatID = C.ChatID ORDER BY UnreadCount DESC, LastPostAt DESC';
        LocalDataMgr.handleSql(trans, sql, success);
    },

    // 不要用
    getRLastPostAt(success) {
        var me = this;
        me.getDB().transaction(function (trans) {
            // me.ensureRChatTable(trans);

            var sql = 'SELECT TOP 1 LastPostAt FROM IMRct ORDER BY LastPostAt DESC';
            me.handleSql(trans, sql, success);
        });
    },

    /**
     * 分页获取历史记录,
     */
    getHistory(success, pageFrom, cid) {
        var me = this;
        me.getDB().transaction(function (trans) {
            // me.ensureMessageTable(trans);
            var sql = 'select * from IMMsg where ChatID="' + cid + '" ORDER BY CreateAt DESC limit ' + pageFrom + ',20';
        });
    },

    // 本地查出最后一条消息的时间
    getLastMsgTime(chatID, success) {
        var result = 0;
        var sql = 'select CreateAt from IMMsg where ChatID="' + chatID + '" order by CreateAt desc limit 0,1';
        this.getDB().executeSql(sql, null, function (resultSet) {
            success(resultSet);
        });

        return result;
    },

    /* ********************************************** 写 *********************************************/

    /* ************************************************* IMRct *****************************************************************/

    /**
     * 更新最近会话
     * @param {Array} data 获取到的最新的最近会话数据
     */
    initUpdateChats(data) {
        var me = this,
            sql = '';

        me.getDB().transaction(function (trans) {
            for (var i = 0; i < data.length; i++) {
                switch (data[i].chat.chat_type) {
                    case ChatType.Direct:
                        break;
                    case ChatType.Group:
                        var res = me.getUsersMsg(data[i].members),
                            ids = res.ids,
                            names = res.names;

                        sql += 'INSERT OR REPLACE INTO IMChat ' +
                            '(ChatID, DisplayName, CreatorID, CreatorName, ManagerID, ManagerName, CreateAt, UserIDs, UserNames) VALUES' +
                            '("' + data[i].chat.chat_id + '", "' + data[i].chat.header + '", "' + data[i].chat.creator_id + '", "' + data[i].chat.creator_name + '", "' + data[i].chat.manager_id + '", "' + data[i].chat.manager_name + '", ' + data[i].chat.create_at + ', "' + ids + '", "' + names + '");';
                        break;
                    default:
                        break;
                }
                sql += 'INSERT OR REPLACE INTO IMRct (ChatID, DisplayName, ChatType, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage, LastMsgType) VALUES ("' + data[i].chat.chat_id + '","' + data[i].chat.channelname + '","' + data[i].chat.chat_type + '",' + data[i].chat.unread_count + ',' + data[i].chat.last_post_at + ',"' + data[i].chat.last_sender + '","' + data[i].chat.last_sender_name + '","' + data[i].chat.last_message + '","' + data[i].chat.last_msg_type + '");';
            }

            me.handleSql(trans, sql);
        });
    },

    /**
     * 根据成员信息拼成字符串,ids,names
     * @param {*} members 
     */
    getUsersMsg(members) {
        var result = {}, ids = [], names = [];
        for (var j = 0; j < members.length; j++) {
            ids.push(members[j].user_id);
            names.push(members[j].user_name);
        }
        ids = ids.join(',');
        names = names.join(',');
        result.ids = ids;
        result.names = names;
        return result;
    },

    /**
     * 自己将从服务端获取到的数据处理一下
     * @param {json} data 需要更新的数据
     * {chat:{},members:{}}
     */
    updateRctChat(data) {
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
     * 新建单人会话
     * @param {json} data ({chat_id:xxx,chat_name:xxx,...})
     */
    createDitChat(data) {
        var me = this;
        me.getDB().transaction(function (trans) {
            // me.ensureRChatTable(trans);

            var sql = 'INSERT INTO IMRct (ChatID, DisplayName, ChatType, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage, LastMsgType) VALUES ("' + data.chat_id + '","' + data.display_name + '","' + data.chat_type + '",' + data.unread_count + ',' + data.last_post_at + ',"' + data.last_sender + '","' + data.last_sender_name + '","' + data.last_message + '", "' + data.last_msg_type + '");';
            me.handleSql(trans, sql);
        });
    },

    /**
     * 新建多人会话
     * @param {json} data
     */
    createGrpChat(data) {
        const me = this;
        me.getDB().transaction(function (trans) {
            var content = GroupNotice.createNewGrpNotice(data.creator_id, data.members);

            var sql = 'INSERT INTO IMRct ' +
                '(ChatID, ChatType, DisplayName, LastPostAt, LastMessage, LastMsgType) VALUES ' +
                '("' + data.chat_id + '", "' + data.chat_type + '", "' + data.header + '", ' + data.create_at + ', "' + content + '", "' + MsgType.GroupNotice + '");';

            var ids = [], names = [];
            for (var i = 0; i < data.members.length; i++) {
                ids.push(data.members[i].user_id);
                names.push(data.members[i].user_name);
            }
            ids = ids.join(',');
            names = names.join(',');

            sql += 'INSERT INTO IMChat ' +
                '(ChatID, DisplayName, CreatorID, CreatorName, ManagerID, ManagerName, CreateAt, UserIDs, UserNames) VALUES' +
                '("' + data.chat_id + '", "' + data.header + '", "' + User.ownerID + '", "' + User.crtUser.user_name + '", "' + data.manager_id + '", "' + User.crtUser.user_name + '", ' + data.create_at + ', "' + ids + '", "' + names + '");';


            sql += 'INSERT INTO IMMsg ' +
                '(MsgID, ChatID, MsgType, Content, CreateAt, Status) VALUES ' +
                '("' + me.newGuid() + '", "' + data.chat_id + '", "' + MsgType.GroupNotice + '", "' + content + '", ' + data.create_at + ', 0);';
            me.handleSql(trans, sql);
        });
    },

    /**
     * ws请求过来后，更新最近会话
     * @param {json} data
     */
    updateRctByWS(data) {
        const me = this;

        me.getDB().transaction(function (trans) {
            var sql = 'UPDATE IMRct SET UnreadCount=UnreadCount+1,LastPostAt=' + data.create_at + ',LastUserID="' + data.user_id + '",LastUserName="' + data.user_name + '",LastMessage="' + data.message + '" WHERE ChatID="' + data.chat_id + '";';

            me.handleSql(trans, sql);
        });
    },

    /**
     * ws收到响应，增加最近会话
     * @param {json} data
     */
    insertRctByWS(data) {
        const me = this;

        me.getDB().transaction(function (trans) {
            var sql = 'INSERT INTO IMRct (ChatID, ChatType, DisplayName, UnreadCount, LastPostAt, LastUserID, LastUserName, LastMessage, LastMsgType, IsTop, AtCount) VALUES ("' + data.chat_id + '","' + data.chat_type + '","' + data.chat_name + '",0,' + data.create_at + ',"' + data.user_id + '","' + data.user_name + '","' + data.message + '","' + data.msg_type + '","",0);';

            me.handleSql(trans, sql);
        });
    },

    /**
     * 发送消息，更新最近会话列表
     * @param {json} data
     */
    updateRctBySend(data) {
        const me = this;

        me.getDB().transaction(function (trans) {
            var sql = 'UPDATE IMRct SET LastPostAt=' + data.createAt + ', LastUserID="' + data.userID + '", LastUserName="' + data.userName + '", LastMessage="' + data.content + '" WHERE ChatID="' + data.chatID + '";';

            me.handleSql(trans, sql);
        });
    },

    /**
     * 发送成功后调用，更新最近会话列表
     */
    updateRctBySendS() {
        const me = this;

        me.getDB().transaction(function (trans) {
            var sql = ''; // Rct表应该也有一个字段标志是否成功发送

        });
    },

    /**
     * 最近会话将未读设置为已读
     * @param {string} cid chatID
     */
    rctSetUnreadToRead(cid) {
        const me = this;

        me.getDB().transaction(function (trans) {
            var sql = 'UPDATE IMRct SET UnreadCount=0 WHERE ChatID="' + cid + '"';

            me.handleSql(trans, sql);
        });
    },

    /* ************************************************* IMMsg *****************************************************************/

    /**
     * 初始化插入未读消息
     * @param {json} data 拼好的数据
     */
    initAddToMsg(data) {
        var me = this,
            sqls = '',
            sql = '';

        me.getDB().transaction(function (trans) {

            var status = '0'; // 成功状态

            for (var i = 0; i < data.length; i++) {

                sql = 'INSERT INTO IMMsg (MsgID, ChatID, MsgType, Content, FilePath, CreateAt, SenderID, SenderName, Status) VALUES ("' + data.msg_id + '","' + data.chat_id + '","' + data.msg_type + '","' + data.message + '","' + data.file_path + '",' + data.create_at + ',"' + data.user_id + '","' + data.user_name + '","' + status + '")';

                sqls += sql;
                // switch (msgList[i].wrapper_type) {
                //     case MsgWrapperType.Message:
                //         sql = 'INSERT INTO IMMsg (MsgID, ChatID, MsgType, Content, FilePath, CreateAt, SenderID, SenderName, Status) VALUES ("' + msgList[i].message.msg_id + '","' + msgList[i].message.chat_id + '","' + msgList[i].message.msg_type + '","' + msgList[i].message.message + '","' + msgList[i].message.file_path + '",' + msgList[i].message.create_at + ',"' + msgList[i].message.user_id + '","' + msgList[i].message.user_name + '","' + status + '")';

                //         sqls += sql;
                //         break;
                //     case MsgWrapperType.Notice:
                //         // 组织一下content
                //         break;
                //     default:
                //         break;
                // }


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
    updateMsgBySendS(data) {
        const me = this;
        // status = '0';

        me.getDB().transaction(function (trans) {
            var sql = 'UPDATE IMMsg SET Status=0 WHERE ChatID="' + data.chat_id + '"';

            me.handleSql(trans, sql);
        });
    },

    /**
     * 接收到websocket信息后，添加消息进入表中
     * @param {json} data
     */
    insertOMsg(data) {
        const me = this;

        me.getDB().transaction(function (trans) {
            // me.ensureMessageTable(trans);
            var status = '0'; // 成功态
            var sql = 'INSERT INTO IMMsg (MsgID, ChatID, MsgType, Content, FilePath, CreateAt, SenderID, SenderName, Status) VALUES ("' + data.msg_id + '","' + data.chat_id + '","' + data.msg_type + '","' + data.message + '","' + data.filePath + '",' + data.create_at + ',"' + data.user_id + '","' + data.user_name + '","' + status + '")';

            me.handleSql(trans, sql);
        });
    },

    /**
     * 消息发送成功前调用
     * @param {*} data
     */
    beforeSendMsgS(data) {

    },

    /**
     * 消息发送成功后调用
     */
    afterSendMsgS(data) {

    },






    initGetOrg(success) {
        var me = this;
        me.getDB().transaction(function (trans) {
            var sql = 'select * from IMUsr';

            me.handleSql(trans, sql, function (tas, resultSet) {
                var rows = resultSet.rows;
                if (rows.length > 0) {
                    var users = [],
                        user = {};
                    for (var i = 0; i < rows.length; i++) {
                        user.user_id = rows.item(i).UserID;
                        user.user_name = rows.item(i).UserName;
                        user.org_ids = rows.item(i).OrgIDs;
                        user.age = rows.item(i).Age;
                        user.custom_mark = rows.item(i).CustomMark;
                        user.def_role_name = rows.item(i).DefRoleName;
                        user.email = rows.item(i).Email;
                        user.mobile = rows.item(i).Mobile;
                        user.notes = rows.item(i).Notes;
                        user.phone = rows.item(i).Phone;
                        user.sex = rows.item(i).Sex;
                        users.push(user);
                    }
                    User.allUsers = users;

                    sql = 'select * from IMOrg';
                    me.handleSql(tas, sql, function (tx, rs) {
                        var rws = rs.rows;
                        if (rws.length > 0) {
                            var orgs = [],
                                org = {};
                            for (var i = 0; i < rws.length; i++) {
                                org.org_id = rws.item(i).OrgID;
                                org.org_name = rws.item(i).OrgName;
                                org.parent_id = rws.item(i).ParentID;
                                org.remarks = rws.item(i).Remarks;
                                orgs.push(org);
                            }
                            User.organization = orgs;
                        }

                        // 当数据都加载成功后调用
                        success();
                    });
                } else {
                    success();
                }
            });
        });
    },

    /**
     * 根据服务端返回的数据组织sql，写入数据库
     * @param {Array} users 服务端返回的users
     * @param {Array} orgs 服务端返回的orgs
     */
    initUpdateOrg(users, orgs) {
        var me = this;
        me.getDB().transaction(function (trans) {
            var sqls = '';
            for (var i = 0; i < users.length; i++) {
                sqls += 'INSERT OR REPLACE INTO IMUsr ' +
                    '(UserID, UserName, Age, CustomMark, DefRoleName, Email, Mobile, Notes, OrgIDs, Phone, Sex) VALUES ' +
                    '("' + users[i].user_id + '", "' + users[i].user_name + '", ' + users[i].age + ', "' + users[i].custom_mark + '", "' + users[i].def_fole_name + '", "' + users[i].email + '", "' + users[i].mobile + '", "' + users[i].notes + '", "' + users[i].org_ids + '", "' + users[i].phone + '", "' + users[i].sex + '"); ';
                // ' WHERE UserID = "' + users[i].user_id + '";';
            }

            for (var j = 0; j < orgs.length; j++) {
                sqls += 'INSERT OR REPLACE INTO IMOrg ' +
                    '(OrgID, OrgName, ParentID, Remarks) VALUES ' +
                    '("' + orgs[j].org_id + '", "' + orgs[j].org_name + '", "' + orgs[j].parent_id + '", "' + orgs[j].remarks + '") ;';
                // 'WHERE OrgID = "' + orgs[i].org_id + '";';
            }

            me.handleSql(trans, sqls);
        });

    }
});