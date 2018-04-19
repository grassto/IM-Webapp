# IMMobile/src

This folder contains source code that will automatically be added to the classpath when
the package is used.
    
IMMobileChatView这边写的还是不好，本来想要复用，而把创建会话也写在这的，现在发现不行，不怎么好用，先自己创建吧。

跳转到聊天页面，内存处理
    User.chatMemID 若存在，则表示是从组织结构那边过来的，而且只有单人会话
    这个现在都处理过了，之后的就不管它了。
    
    User.crtChatName 标题头需赋值

   