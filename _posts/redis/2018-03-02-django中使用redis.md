---
layout: post
title: 'django中使用redis'
subtitle: 'redis'
date: 2018-03-02
categories: 技术
tags: Redis
---

## 建立连接

### redis-py

~~~python
#pip3 install redis

import redis
# 操作模式
r = redis.Redis(host='10.211.55.4', port=6379)
r.set('foo', 'Bar')
print r.get('foo')
# 连接池，可以多个
import redis
 
pool = redis.ConnectionPool(host='10.211.55.4', port=6379)
 
r = redis.Redis(connection_pool=pool)
r.set('foo', 'Bar')
print r.get('foo')

~~~

### Django-redis

安装:  

```
pip3 install django-redis
```

使用：

~~~python
# settiongs.py
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "PASSWORD":"password"
        }
    }
}
# viwes.py
~~~

