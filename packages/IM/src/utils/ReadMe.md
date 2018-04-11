ConnectHelper
主要是刚进页面时，通过API从服务端获取数据，并处理初始的页面缓存数据

BindHelper
处理数据绑定相关，如：绑定组织结构树数据等

ChatHelper
与聊天相关的api操作

ParseHelper
处理消息发送接收等数据解析的工作

StatusHelper
处理状态

preferenceHelper
有关附加功能的处理，如：消息置顶、删除等。

GroupSelHelper
处理打开选人框的多人会话，
一条主线，内存User.crtChatMembers存储的是当前默认选中用户的ID，Array