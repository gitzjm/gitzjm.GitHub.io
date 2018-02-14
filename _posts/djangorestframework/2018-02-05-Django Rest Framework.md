---
layout: post
title: 'Django Rest Framework (1)'
subtitle: 'Django进阶之Django Rest Framework'
date: 2018-02-05
categories: 技术
tags: Django
---

## 序1:什么是RESTful

### 什么是RESTful

REST是Representational State Transfer的简称，中文翻译为“表征状态转移”。RESTful是一种软件架构风格、设计风格，而**不是**标准，只是提供了一组设计原则和约束条件。它主要用于客户端和服务器交互类的软件。基于这个风格设计的软件可以更简洁，更有层次，更易于实现缓存等机制。

### 原则条件

REST 指的是一组架构[约束条件](https://baike.baidu.com/item/%E7%BA%A6%E6%9D%9F%E6%9D%A1%E4%BB%B6)和原则。满足这些约束条件和原则的应用程序或设计就是 RESTful。

Web 应用程序最重要的 REST 原则是，客户端和服务器之间的交互在请求之间是无状态的。从客户端到服务器的每个请求都必须包含理解请求所必需的信息。如果服务器在请求之间的任何时间点重启，客户端不会得到通知。此外，无状态请求可以由任何可用服务器回答，这十分适合[云计算](https://baike.baidu.com/item/%E4%BA%91%E8%AE%A1%E7%AE%97)之类的环境。客户端可以缓存数据以改进性能。

在服务器端，应用程序状态和功能可以分为各种资源。资源是一个有趣的概念实体，它向客户端公开。资源的例子有：应用程序对象、数据库记录、算法等等。每个资源都使用 URI (Universal Resource Identifier) 得到一个唯一的地址。所有资源都共享统一的接口，以便在客户端和服务器之间传输状态。使用的是标准的 HTTP 方法，比如 GET、PUT、[POST](https://baike.baidu.com/item/POST) 和[DELETE](https://baike.baidu.com/item/DELETE)。[Hypermedia](https://baike.baidu.com/item/Hypermedia) 是应用程序状态的[引擎](https://baike.baidu.com/item/%E5%BC%95%E6%93%8E/2874935)，资源表示通过[超链接](https://baike.baidu.com/item/%E8%B6%85%E9%93%BE%E6%8E%A5)互联。

## 序2:RESTful API 设计规范

- API与用户的通信协议，总是使用[HTTPs协议](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)。

- 域名规范

  >API:
  >
  >https://api.example.com                        尽量将API部署在专用域名（会存在跨域问题）,尽量避免发送复杂请求
  >
  >https://example.org/api/                        比较简单的方法,不存在跨域问题
  >
  >版本:
  >
  >写在URL路径中:https://api.example.com/v1/
  >
  >写在请求头中                                             跨域时，会引发发送多次请求
  >
  >路径:用名次表示资源
  >
  >https://api.example.com/v1/zoos

- method

  >通过对同一URL不同的请求方式服务端进行相应的操作
  >
  >- GET      ：从服务器取出资源（一项或多项）
  >- POST    ：在服务器新建一个资源
  >- PUT      ：在服务器更新资源（客户端提供改变后的完整资源）
  >- PATCH  ：在服务器更新资源（客户端提供改变的属性）
  >- DELETE ：从服务器删除资源

  ​

- 过滤,通过在url上传参数的形式传递搜索条件

  >https://api.example.com/v1/zoos?limit=10：指定返回记录的数量
  >
  >https://api.example.com/v1/zoos?offset=10：指定返回记录的开始位置
  >
  >https://api.example.com/v1/zoos?page=2&per_page=100：指定第几页，以及每页的记录数
  >
  >https://api.example.com/v1/zoos?sortby=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序
  >
  >https://api.example.com/v1/zoos?animal_type_id=1：指定筛选条件

- 状态码

  ~~~ Python
  200 OK - [GET]：服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
  201 CREATED - [POST/PUT/PATCH]：用户新建或修改数据成功。
  202 Accepted - [*]：表示一个请求已经进入后台排队（异步任务）
  204 NO CONTENT - [DELETE]：用户删除数据成功。
  400 INVALID REQUEST - [POST/PUT/PATCH]：用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的。
  401 Unauthorized - [*]：表示用户没有权限（令牌、用户名、密码错误）。
  403 Forbidden - [*] 表示用户得到授权（与401错误相对），但是访问是被禁止的。
  404 NOT FOUND - [*]：用户发出的请求针对的是不存在的记录，服务器没有进行操作，该操作是幂等的。
  406 Not Acceptable - [GET]：用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
  410 Gone -[GET]：用户请求的资源被永久删除，且不会再得到的。
  422 Unprocesable entity - [POST/PUT/PATCH] 当创建一个对象时，发生一个验证错误。
  500 INTERNAL SERVER ERROR - [*]：服务器发生错误，用户将无法判断发出的请求是否成功。

  更多看这里：http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html参数处理

  ~~~

- 错误处理

  ~~~python
  # 状态码为4xx时,应该返回错误信息,error当作key
  {
      error:"Invalid API key"
  }
  ~~~

- 返回结果,针对不同操作,服务器向用户返回的结果应该符合以下规范

  ~~~Python
  GET /collection：返回资源对象的列表（数组）
  GET /collection/resource：返回单个资源对象
  POST /collection：返回新生成的资源对象
  PUT /collection/resource：返回完整的资源对象
  PATCH /collection/resource：返回完整的资源对象
  DELETE /collection/resource：返回一个空文档
  ~~~

- Hypermedia API，RESTful API最好做到Hypermedia，即返回结果中提供链接，连向其他API方法，使得用户不查文档，也知道下一步应该做什么。

  ~~~
  {
  	"link": {
        "rel":   "collection https://www.example.com/zoos",
        "href":  "https://api.example.com/zoos",
        "title": "List of zoos",
        "type":  "application/vnd.yourformat+json"
  	}
  }
  ~~~

## 基于Django的REST

urls.py:

~~~python
urlpatterns = [
    url(r'^users', app.Users.as_view()),
]
~~~

views.py(CBV):

~~~python
from django.views import View
from django.http import JsonResponse
 
class Users(View):
    def get(self, request, *args, **kwargs):
        result = {
            'status': True,
            'data': 'response data'
        }
        return JsonResponse(result, status=200)
 
    def post(self, request, *args, **kwargs):
        result = {
            'status': True,
            'data': 'response data'
        }
        return JsonResponse(result, status=200) 
~~~

