@echo off
title PushIM-Webapp
echo 开发时监控sass、js等，实时编译 

call sencha app watch -fashion --port 2022 -packages IM,IMMobile

pause