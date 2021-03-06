Ext.define('IMCommon.utils.UpImgMgr', {
    alternateClassName: 'UpImgMgr',
    singleton: true,

    /**
     * 
     * @param {*} attid 
     * @param {*} localPath 本地路径
     */
    parsePic(attid, localPath) {

    },

    pushImgToQue(datas) {
        var chatID = datas[0].chat_id,
            isNew = false;
        // 若不存在这个队列
        if (!UpImgMgr[chatID]) {
            UpImgMgr[chatID] = [];
            isNew = true;
        } else if (UpImgMgr[chatID].length == 0) { // 存在这个队列，当队列里数量为0时，触发
            isNew = true;
        }
        for (var i = 0; i < datas.length; i++) {
            UpImgMgr[chatID].push(datas[i]);
        }

        if (isNew) {
            UpImgMgr.doUploadImg(UpImgMgr[chatID].shift());
        }
    },

    doUploadImg(data) {

        var chatID = data.chat_id,
            fileURL = data.fileURL;

        // 去除字符串前的file:///
        var reg = /file:[\/]+/g;
        fileURL = fileURL.replace(reg, '');

        var options = new FileUploadOptions();

        options.fileKey = 'files';
        // options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.fileName = FileUtil.getFileName(fileURL);
        options.mimeType = 'image/png';

        options.params = {
            chat_id: data.chat_id,
            client_ids: data.client_id,
            file_id: data.attach_id,
            is_origins: 'Y' // PC端默认为Y
        };


        var ft = new FileTransfer();
        ft.upload(fileURL, encodeURI(Config.httpUrlForGo + 'files?token=' + User.token), (res) => {
            console.log('图片上传成功', res);
            // 更新本地数据库状态
            var wrapData = JSON.parse(res.response);

            for (var i = 0; i < wrapData.files.length; i++) {
                var surePath = `${User.ownerID}/images/${wrapData.files[i].file_id}`, // 指定路径
                nativePath = (window.cordova || window.cefMain).file.dataDirectory;
                // 移动图片到指定路径
                FileMgr.copyTo(null, data.fileURL, 1, surePath).then(path => {
                    // 更换页面上图片的路径
                    if (Config.isPC) {
                        var chat = Ext.StoreManager.getByKey(data.chat_id);
                        if (chat) {
                            if (chat.getById(data.msg_id)) {
                                // 这边只改变页面的消息状态即可
                                chat.getById(data.msg_id).set('sendText', ParseUtil.getLocalPic(path));
                                AddDataUtil.onScrolMsgView();
                            }
                        }

                    }
                }).catch(err => {
                    console.error('UpImgMgr', 'movePic failed', err);
                });

                // 保存本地
                LocalDataMgr.afterUploadSuc(wrapData.files[i], `${nativePath}${surePath}`);
            }
            // var msgID = wrapData.files[0].msg_id;
            // LocalDataMgr.afterUploadSuc(msgID);

            var lastOne = UpImgMgr[chatID].shift();
            if (lastOne) {
                UpImgMgr.doUploadImg(lastOne);
            }
        }, (err) => {
            console.log('图片上传失败了', err);
        }, options);
    }
});