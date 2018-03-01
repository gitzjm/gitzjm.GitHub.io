---
layout: post
title: 'Ubuntu下Redis下的安装和使用'
subtitle: 'Django进阶之Django Rest Framework'
date: 2018-02-06
categories: 技术
tags: Django
---

安装

```Shell
sudo apt-get update
sudo apt-get install redis-server
```

配置可远程访问：

~~~shell
sudo vi /etc/redis/redis.conf
打开conf配置文件，讲127.0.0.0注释掉即可
~~~

启动

```shell
sudo /usr/bin/redis-server /etc/redis/redis.conf
```

建立远程连接

~~~shell
redis-cli -h 地址 -p 端口 -a 密码
~~~

