---
layout: post
title: 'Django Rest Framework (2)'
subtitle: 'Django进阶之Django Rest Framework'
date: 2018-02-06
categories: 技术
tags: Django
---

## 基于Django Rest Framework实现

### 一.基本流程

urls.py

~~~python
from django.conf.urls import url, include
from app01 import TestView
 
urlpatterns = [
    url(r'^test/', TestView.as_view()),
]
~~~

views.py

~~~python
from rest_framework.views import APIView
from rest_framework.response import Response
 
 
class TestView(APIView):
    def dispatch(self, request, *args, **kwargs):
        """
        请求到来之后，都要执行dispatch方法，dispatch方法根据请求方式不同触发 get/post/put等方法
         
        注意：APIView中的dispatch方法有好多好多的功能
        """
        return super().dispatch(request, *args, **kwargs)
 
    def get(self, request, *args, **kwargs):
        return Response('GET请求，响应内容')
 
    def post(self, request, *args, **kwargs):
        return Response('POST请求，响应内容')

~~~

### 二.源码剖析

1.view中视图类继承了APIView,URL请求进入时会先触发APIView类中的dispatch函数,dispatch函数做了如下操作:

- 封装request函数

  ```python
  Request(
      request,#原先的request
      #封装了下面几个东西
      parsers=self.get_parsers(),
      authenticators=self.get_authenticators(),
      negotiator=self.get_content_negotiator(),
      parser_context=parser_context
  )
  ```

- 使用反射将不同的method请求返回为相应的方法

dispatch()源码：

  ```python
  class APIView():
    ...
    def dispatch(self, request, *args, **kwargs):
      """
      `.dispatch()` is pretty much the same as Django's regular dispatch,
      but with extra hooks for startup, finalize, and exception handling.
      """
      self.args = args
      self.kwargs = kwargs
      # 1.包装request
      request = self.initialize_request(request, *args, **kwargs)
      self.request = request
      self.headers = self.default_response_headers  # deprecate?

      try:
          self.initial(request, *args, **kwargs)
  		#2.这个函数初始化了版本,认证,权限和限流功能
          # Get the appropriate handler method
          if request.method.lower() in self.http_method_names:
              #3.利用反射将请求通过请求的类型转换为方法
              handler = getattr(self, request.method.lower(),
                                self.http_method_not_allowed)
          else:
              handler = self.http_method_not_allowed
  		#4. 执行方法函数并返回给response(结果为HttpResponse之类的页面信息等)
          response = handler(request, *args, **kwargs)

      except Exception as exc:
          response = self.handle_exception(exc)
  	#5.包装处理response并返回
      self.response = self.finalize_response(request, response, *args, **kwargs)
      return self.response
  ```

  APIView-->initial()初始化相关功能的函数,在上面的dispatch()调用了

  ```python
  def initial(self, request, *args, **kwargs):
      """
      Runs anything that needs to occur prior to calling the method handler.
      """
      self.format_kwarg = self.get_format_suffix(**kwargs)

      # Perform content negotiation and store the accepted info on the request
      neg = self.perform_content_negotiation(request)
      request.accepted_renderer, request.accepted_media_type = neg

      # Determine the API version, if versioning is in use.
      '2.1处理版本信息'
      version, scheme = self.determine_version(request, *args, **kwargs)
      request.version, request.versioning_scheme = version, scheme

      # Ensure that the incoming request is permitted
      '2.2认证'
      self.perform_authentication(request)
      '2.3权限'
      self.check_permissions(request)
      '2.4访问限制'
      self.check_throttles(request)
  ```

  ​