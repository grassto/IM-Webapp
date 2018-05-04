环境要求：
更新到最新的Android SDK（Android Support Respositry，不要忽视，很多问题都是因为没做这一步）



version.txt是示例，放到服务端


verCode: - version Code, 整数版本号，即内部build号
verName: - version Name，字符串版本号，给用户看的
apkPath：普通apk文件下载地址
forceUpdate: true/false 是否必须更新，用户点取消会退出app
releaseLog: - 新版说明



如果你用了XWalk(cordova-plugin-crosswalk)，请看下面，否则忽略：

apkChromePath：集成了XWalk的apk（ARM版）下载地址
apkChromeX86Path：集成了XWalk的apk（x86版）下载地址

如果当前运行的app，集成有XWalk，那么下载新版的时候，也会下载集成有XWalk的apk（自动检测当前手机是ARM还是x86的架构，会自动选apkChromePath/apkChromeX86Path）；
否则，下载普通版本的apk。


关于版本号的判断，普通版apk没问题，主要是集成有XWalk的apk，版本号会在末尾加2、4、6、8之类的数字。
比如：
versionName=1.1.2
versionCode=10102

普通版apk最后的结果是
versionName=1.1.2
versionCode=10102

XWalk(ARM)最后的结果是
versionName=1.1.2
versionCode=101024

XWalk(x86)最后的结果是
versionName=1.1.2
versionCode=101028

所以集成了XWalk的app，获取当前app的版本用的是：
versonCode / 10
计算得到的，不直接取versionCode。