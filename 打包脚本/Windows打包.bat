@echo off
title ���PushIM-Webapp
set currentpath=%~dp0
set apppath=%~dp0..
echo ��һ��ʹ��ǰ��򿪴�bat�ļ����޸�Ϊ�㱾����·��
set packagepath=D:\PushIM2.0\PushIM2.0-Webapp\packages

:start
IF NOT EXIST %packagepath% (md %packagepath%)
cd /d %currentpath%
echo r ����ΪRelease
echo d ����ΪDebug
echo rm �Ƴ��ɵ�android��Ŀ
echo 1 ���Android
echo 4 ���Production
echo 5 ���Testing
echo q �˳�
set /p c=��ѡ��: 
if "%c%"=="r" goto configrelease
if "%c%"=="d" goto configdebug
if "%c%"=="rm" goto rmandroid
if "%c%"=="1" goto pubandroid
if "%c%"=="4" goto pubprodution
if "%c%"=="5" goto pubtesting
if "%c%"=="q" goto end
goto start


:configrelease
call ant -buildfile configure_release.xml
echo -----------------------����Release���-----------------------

goto start

:configdebug
call ant -buildfile configure_debug.xml
echo -----------------------����Debug���-----------------------

goto start



:rmandroid
cd ..
cd cordova
call cordova platform rm android
cd ..

goto start




:pubandroid
call ant -buildfile replace_appversion.xml

cd ..\cordova
rmdir www /S /Q
md www
cd ..

sencha -info app build -uses android
echo -----------------------Build�ɹ�-----------------------

goto copyapk




:pubprodution
cd ..
rmdir build\production /S /Q
sencha -info app build -uses
echo -----------------------������-----------------------

goto start


:pubtesting
cd ..
rmdir build\testing /S /Q
sencha -info app build -uses testing
echo -----------------------������-----------------------

goto start


:copyapk
set outputpath=%apppath%\cordova\platforms\android\app\build\outputs\apk\debug
for /f %%a in ('dir /b/a %outputpath%\^|findstr ".apk"') do (
echo.%%~na|findstr /v "unaligned" &&xcopy %outputpath%\%%a %packagepath%\ /e /Y
)
set outputpath=%apppath%\cordova\platforms\android\app\build\outputs\apk\release
for /f %%a in ('dir /b/a %outputpath%\^|findstr ".apk"') do (
echo.%%~na|findstr /v "unaligned" &&xcopy %outputpath%\%%a %packagepath%\ /e /Y
)
echo -----------------------����APK�ɹ�-----------------------
goto start


:end
exit