/**
 * Created by zhongpeng on 2017/5/31.
 */
var exec = require('cordova/exec');

module.exports = {
    /**
     * 获取图片地址
     * @param onSuccess
     * @param onFail
     * @param params
     */
    getPictures: function(onSuccess, onFail, params) {
        // defaults
        var options = {
            maximumImagesCount: 9,
            width: -1, // negative value means auto scale
            height: -1,
            quality: 80
        }
        if(params && toString.call(params) === '[object Object]') {
            for(var i in params) {
                if(params.hasOwnProperty(i)) {
                    options[i] = params[i];
                }
            }
        }

        exec(onSuccess, onFail, "ImagePicker", "getPictures", [options]);
    }
};
