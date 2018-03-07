Ext.define('IM.utils.ParseHelper', {
    alternateClassName: 'ParseHelper',
    singleton: true,

    // 解析URL之后做
    parseURL(message) {
        // debugger;
        var reg = /^(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$/ig;
        var result = message.replace(reg, function (str) {
            return '<a href="' + str + '">' + str + '</a>';
        });
        return result;
    },

    parsePic(message, fileIds) {
        // file_id为26位的guid号
        var reg = /\[\w{26}\]/ig;
        var result = message.replace(reg, function (str) {
            var out = '',
                id = str.substring(1, str.length - 1);
            // // // debugger;
            if (fileIds && fileIds.length > 0) {
                for (var i = 0; i < fileIds.length; i++) {
                    if (fileIds[i] == id) {
                        // out = '<img class="viewPic" src="' + Config.httpUrlForGo + 'files/' + id + '">';  // "'/thumbnail">';
                        out = '<img class="viewPic" src="' + Config.httpUrlForGo + 'files/' + id + '/thumbnail">';
                        break;
                    } else {
                        out = str;
                    }
                }
            }
            return out;
        });
        return result;
    }
});