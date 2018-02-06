## MTV模型

jango的MTV分别代表：

```python
Model(模型)：负责业务对象与数据库的对象(ORM)

Template(模版)：负责如何把页面展示给用户

View(视图)：负责业务逻辑，并在适当的时候调用Model和Template
```

## Django基本命令

1.下载Django

```python
pip3 install django
```

2.创建一个django project

```python
django-admin.py startproject mysite
```

3.在mysite目录下创建应用

```python
python manage.py startapp blog
```

4.启动django项目

```python
python manage.py runserver 8080
```

5.同步更改数据库表或者字段

```python
python manage.py syncdb
注意:Django 1.7.1及以上版本需要用到以下命令
python manage.py makemigrations
python manage.py migrate
```

6.清空数据库

```python
python manage.py flush
```

7、创建超级管理员

```python
python manage.py createsuperuser

# 按照提示输入用户名和对应的密码就好了邮箱可以留空，用户名和密码必填

# 修改 用户密码可以用：
python manage.py changepassword username
```

8.Django 项目环境终端

```python
python manage.py shell
```

urlpatterns = [ url(正则表达式, views视图函数，参数，别名), ]

```python
参数说明：

一个正则表达式字符串
一个可调用对象，通常为一个视图函数或一个指定视图函数路径的字符串
可选的要传递给视图函数的默认参数（字典形式）
一个可选的name参数

'''
```

url反向解析