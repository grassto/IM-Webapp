tell application "Terminal"
	
	do script "cd /Users/pushsoft2/Desktop/PushIM-Webapp;
ant -buildfile 打包脚本/configure_release.xml;
ant -buildfile 打包脚本/replace_appversion.xml;
cd cordova
cordova platform rm ios
cd ..
PATH=/Users/pushsoft2/bin/Sencha/Cmd/6.5.3.6:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin;
cd cordova
rm -r -f www
mkdir www
cd ..
sencha -info app build -uses ios;
open cordova/platforms/ios/IM.xcodeproj;"
	
end tell