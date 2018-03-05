---
layout: post
title: 'ubuntu安装和配置rabbitmq'
subtitle: 'rabbitmq安装和简单的配置'
date: 2018-02-21
categories: 技术
tags: linux
---

## ubuntu下安装

**1**、使用此命令进行rabbitmq-server的安装（包括依赖包）

```Shell
apt-get install rabbitmq-server1
```

**2**、rabbitMQ中添加openstack用户。

```shell
命令：rabbitmqctl add_user 用户名 密码
```

```shell
rabbitmqctl add_user zjm zjm1234
```

将用户设置为administrator

~~~Shell
rabbitmqctl set_user_tags zjm  administrator
~~~

同时为openstack用户设置读写等权限

```shell
rabbitmqctl set_permissions openstack ".*" ".*" ".*"1
```

**3**、安装RabbitMQ监控管理插件进行RabbitMQ的管理，插件rabbitmq_management启动成功后就可以通过web页面进行RabbitMQ的监控和管理。

```Shell
rabbitmq-plugins enable rabbitmq_management1
```

**4**、使用浏览器登录：[http://localhost:15672](http://localhost:15672/) RabbitMQ管理系统，在系统中可以对RabbitMQ服务进行channel,queue,用户等的管理。

若想在远程使用guest用户登录，需要修改配置文件：

~~~shell
vi /etc/rabbitmq/rabbitmq.conf
#添加下列字段
[ {rabbit, [ {lookback_users, []}]}].
~~~



注意： 使用阿里云等云服务器需要开放15672和5672端口的访问权限。







## RabbitMQ配置和使用

### 1）. 服务器启动与关闭

启动: 

```Shell
rabbitmq-server –detached

在后台启动：

rabbitmq-server start

关闭:

rabbitmqctl stop

若单机有多个实例，则在rabbitmqctlh后加–n 指定名称
```

### 2）. 插件管理

```Shell
开启某个插件：

rabbitmq-pluginsenable xxx

关闭某个插件：

rabbitmq-pluginsdisablexxx

注意：重启服务器后生效。


```

### 3）.virtual_host管理

```Shell
新建virtual_host: rabbitmqctladd_vhost xxx

撤销virtual_host:rabbitmqctl delete_vhost xxx
```



### 4）. 用户管理

```Shell
新建用户：rabbitmqctl add_user xxxpwd
删除用户: rabbitmqctl delete_user xxx
改密码: rabbimqctlchange_password {username} {newpassword}
设置用户角色：rabbitmqctlset_user_tags {username} {tag ...}
Tag可以为 administrator,monitoring, management
```

### 5）. 权限管理

```Shell
权限设置：set_permissions [-pvhostpath] {user} {conf} {write} {read}
Vhostpath
Vhost路径
user
用户名
Conf
一个正则表达式match哪些配置资源能够被该用户访问。
Write
一个正则表达式match哪些配置资源能够被该用户读。
Read
一个正则表达式match哪些配置资源能够被该用户访问。
```



### 6）. 获取服务器状态信息

```Shell
服务器状态：rabbitmqctl status
队列信息：rabbitmqctl list_queues[-p vhostpath][queueinfoitem ...]
Queueinfoitem可以为：name，durable，auto_delete，arguments，messages_ready，messages_unacknowledged，messages，consumers，memory

Exchange信息：rabbitmqctllist_exchanges[-p vhostpath][exchangeinfoitem ...]
Exchangeinfoitem有：name，type，durable，auto_delete，internal，arguments.
Binding信息：rabbitmqctllist_bindings[-p vhostpath][bindinginfoitem ...]
Bindinginfoitem有：source_name，source_kind，destination_name，destination_kind，routing_key，arguments
Connection信息：rabbitmqctllist_connections [connectioninfoitem ...]
Connectioninfoitem有：recv_oct，recv_cnt，send_oct，send_cnt，send_pend等。
Channel信息：rabbitmqctl list_channels[channelinfoitem ...]
Channelinfoitem有consumer_count，messages_unacknowledged，messages_uncommitted，acks_uncommitted，messages_unconfirmed，prefetch_count，client_flow_blocked

rabbimq-plugins
http://www.rabbitmq.com/man/rabbitmq-plugins.1.man.html
```

### 系统命令

```Shell
卸载

\#rpm -qa|grep rabbitmq

rabbitmq-server-3.6.1-1.noarch

\#rpm -e --nodeps rabbitmq-server-3.6.1-1.noarch

\#rpm -qa|grep erlang

esl-erlang-18.3-1.x86_64

\#rpm -e --nodeps esl-erlang-18.3-1.x86_64

 服务

\#service rabbitmq-server start --后台方式运行

\#service rabbitmq-server stop  --停止运行

\#service rabbitmq-server status --查看状态

插件安装

进入插件安装目录{rabbitmq-server}/plugins/（可以查看一下当前已存在的插件）

cd /usr/lib/rabbitmq/lib/rabbitmq_server-3.6.2/plugins

下载需要的插件（插件下载页面http://www.rabbitmq.com/community-plugins.html）

如下载插件rabbitmq_delayed_message_exchange

wget https://bintray.com/rabbitmq/community-plugins/download_file?file_path=rabbitmq_delayed_message_exchange-0.0.1.ez

（如果下载的文件名称不规则就手动重命名一下如：rabbitmq_delayed_message_exchange-0.0.1.ez）

启用插件
rabbitmq-plugins enable rabbitmq_delayed_message_exchange


```

