### Django-redis

安装:  

```
pip3 install django-redis
```

使用：

```python
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
```

