---
layout: post
title: 'RebbitMQ-Python教程（1）'
subtitle: '队列的消息响应，持久化和公平调度'
date: 2018-03-05
categories: 技术
tags: RabbitMQ
---

## RabbitMQ概述

### 什么叫消息队列

​	消息（Message）是指在应用间传送的数据。消息可以非常简单，比如只包含文本字符串，也可以更复杂，可能包含嵌入对象。

​	消息队列（Messag Queue）是一种应用建的通信方式，消息发送后可以立即返回，由消息系统来确保消息的可靠传递。消息发布者只管把消息发布到MQ中而不用管谁来获取，消息使用者只管从MQ中取消息而不管是谁发布的。这样发布者和使用者都不知道对方的存在。

### 为何用消息队列

​	从上面的描述中可以看出消息队列是一种应用间的异步协作机制，那什么时候需要使用MQ呢？

​	以往常见的订单系统为例，用户点击【下单】按钮后的业务逻辑可能包括：扣减库存、生成相应单据、发红包、发送短信通知。在业务发展初期这些逻辑可能放在一起同步执行，随着业务的发展，订单量增长，需要提升系统服务的性能，这时可以将一些不需要立即生效的操作拆分出来异步执行，比如发放红包、发短信通知等。这种场景下就可以使用MQ，在下单的主流程（比如扣减库存，生成相应单据）完成之后发送一条消息到MQ让主流程快速完结，而由于另外的单独线程拉去MQ的消息（或者由MQ推送消息），当发现MQ中有发红包或发短信之类的消息时，执行相应的业务逻辑。

### RabbitMQ

​	RabbitMQ是一个有Erlong语言开发的AMQP的开源实现

​	RabbitMQ是余款基于AMQP协议的消息中间件，它能够在应用之间提供可靠的消息传输。在易用性，扩展性，高可用性上表现优秀。使用消息中间件利于应用之间的解耦，生产者（服务端）无需知道消费者（服务端）的存在。而且两端可以使用不同的语言编写，大大提高了灵活性。

### RabbitMQ安装

```
for Mac:

bogon:~ zjm$ brew install rabbitmq
bogon:~ zjm$ export PATH=$PATH:/usr/local/sbin
bogon:~ zjm$ rabbitmq-server
```

## RabbitMQ工作模型

### 生产/消费模型结构：

生产者模型：

1. 创建连接RabbitMQ服务
2. 创建通道
3. 创建队列
4. 发送消息
5. 关闭连接

消费者模型：

1. 创建连接RabbitMQ服务
2. 创建通道
3. 创建队列（为防止队列不存在，队列存在也不会重新创建）
4. 接收消息（callback函数）
5. 启动程序，轮询等待消息

### 相关参数示例：

1. #### 消息响应

   默认情况下当消息被RabbitMQ发送给消费者（consumers）之后，马上就会在内存中移除。这种情况，你只要把一个工作者（worker）停止，正在处理的消息就会丢失。同时，所有发送到这个工作者的还没有处理的消息都会丢失。

   当RabbitMQ将消息（任务）给工作者（worker）即消费者处理时，只有消费者给RabbitMQ返回确认消息时，RabbitMQ才认为这条消息被正确处理完成，从而将消息移除。否则RabbitMQ认为消息没有处理，然后将这个任务交给另一个消费者来处理，直到处理完成，这样即使消费者偶尔挂掉也不会丢失消息。

   消息是没有超时这个概念的；当工作者与它断开连的时候，RabbitMQ会重新发送消息。在处理一个耗时非常长的消息任务，消费者容易挂掉的时候就不会出现问题了。

   ​

   基于此，RabbitMQ提供了消息响应（acknowledgments）。消费者会通过一个ack（响应），告诉RabbitMQ已经收到并处理了某条消息，然后RabbitMQ就会删除这条消息。

   > 忘记确认
   >
   > 一个很容易犯的错误就是忘了basic_ack，后果很严重。消息在你的程序退出之后就会重新发送，如果它不能够释放没响应的消息，RabbitMQ就会占用越来越多的内存。
   >
   > 为了排除这种错误，你可以使用rabbitmqctl命令，输出messages_unacknowledged字段：
   >
   > ~~~Python
   > root@iZ2zeamdl6me8p2qw6xrmlZ:~# rabbitmqctl list_queues name messages_ready messages_unacknowledged  
   > Listing queues ...
   > hello	0	6
   > ~~~
   >

   no-ack=False,如果消费者遇到情况(its channel is closed, connection is closed, or TCP connection is lost)挂掉了，那么，RabbitMQ会重新将该任务添加到队列中。

   - 回调函数中添加`ch.basic_ack(delivery_tag=method.delivery_tag)`发送确认消息
   - basic_comsume中的`no_ack=False`打开消息响应

   ​

示例：

~~~Python
# 生产者

import pika

user_info = pika.PlainCredentials(username="guest", password="guest")
connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost",credentials=user_info))#创建连接
channel = connection.channel() #在连接上创建一个通道
channel.queue_declare(queue="hello")#声明一个队列，生产者和消费者都要声明一个相同的队列，用来防止万一某一方挂了，另一方能正常运行
channel.basic_publish(
    exchange="",#交换机
    routing_key="hello",#路由键，写明将消息发往哪个队列，本例是将消息发往队列hello
    body="Hello World!",#生产者要发送的消息
)
print("[生产者] sent 'hello world'")
connection.close()
~~~

~~~python
# 消费者

import pika
import time

user_info = pika.PlainCredentials(username="guest", password="guest")
connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost", credentials=user_info))
channel = connection.channel()

channel.queue_declare(queue="hello")#重复声明不报错，防止队列不存在
current_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())


def callback(ch, method, properties, body):
    """ 
        @ch: channel 通道，是由外部调用时上送 
        out body 
        读取队列内容做不同的操作 
    """
    print("[消费者%s] Received %r" % (current_time,body))

    time.sleep(3)
    print("ok")
    ch.basic_ack(delivery_tag=method.delivery_tag) #发送确认消息，确认信息已处理完毕并删除。重要！若忘记确认会导致消息即使被处理也不会从内存删除，会导致内存溢出。而且如果业务上来讲业务被处理两次后果也很严重！比如一次请求发了两份红包~
channel.basic_consume(callback, queue="hello", no_ack=False)#队列不存在会报错。


print(' [%s] Waiting for messages. To exit press CTRL+C'%current_time)
channel.start_consuming()



结果：
[2018-03-05 21:22:07] Waiting for messages. To exit press CTRL+C
[消费者2018-03-05 21:22:07] Received b'Hello World!'
ok
[消费者2018-03-05 21:22:07] Received b'Hello World!'
ok
[消费者2018-03-05 21:22:07] Received b'Hello World!'
ok

~~~



2. #### 持久化

如果没有特意告诉RabbitMQ，那么在它退出或者崩溃的时候，将会丢失所有队列和消息。为了确保信息不会丢失，有两个事情是需要注意的：我们必须把“队列”和“消息”设为持久化。

队列持久化，需要在声明队列时，通过参数durable=True来声明队列是持久化

~~~python
channel.queue_declare(queue='hello', durable=True)  

#尽管这行代码本身是正确的，但是仍然不会正确运行。因为我们已经定义过一个叫hello的非持久化队列。RabbitMq不允许你使用不同的参数重新定义一个队列，它会返回一个错误。但我们现在使用一个快捷的解决方法——用不同的名字，例如task_queue。
channel.queue_declare(queue='task_queue', durable=True)
~~~

另外，我们需要把我们的消息也要设为持久化——将delivery_mode的属性设为2。

```
channel.basic_publish(exchange='',
                      routing_key="task_queue",
                      body=message,
                      properties=pika.BasicProperties(
                         delivery_mode = 2, # make message persistent
                      ))

```

> ##### 注意：消息持久化
>
> 将消息设为持久化并不能完全保证不会丢失。以上代码只是告诉了RabbitMq要把消息存到硬盘，但从RabbitMq收到消息到保存之间还是有一个很小的间隔时间。因为RabbitMq并不是所有的消息都使用fsync(2)——它有可能只是保存到缓存中，并不一定会写到硬盘中。并不能保证真正的持久化，但已经足够应付我们的简单工作队列。如果你一定要保证持久化，你需要改写你的代码来支持事务（transaction）。

示例：

~~~Python
# 生产者

import pika

user_info = pika.PlainCredentials(username="guest", password="guest")
connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost",credentials=user_info))
channel = connection.channel()
channel.queue_declare(queue="hello2"，durable=True) #声明持久化队列
channel.basic_publish(
    exchange="",
    routing_key="hello2",
    body="Hello World!",
    properties=pika.BasicProperties(
                          delivery_mode=2, #将消息持久化
    )
                      
)
print("[生产者] sent 'hello world'")
connection.close()

# 消费者

import pika
import time

user_info = pika.PlainCredentials(username="guest", password="guest")
connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost",credentials=user_info))
channel = connection.channel()

channel.queue_declare(queue="hello2"，durable=True) #声明持久化队列
current_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())


def callback(ch, method, properties, body):
    print("[消费者%s] Received %r" % (current_time,body))

    time.sleep(3)
    print("ok")
    ch.basic_ack(delivery_tag=method.delivery_tag)
channel.basic_consume(callback, queue="hello2", no_ack=False)


print(' [%s] Waiting for messages. To exit press CTRL+C'%current_time)
channel.start_consuming()

~~~

3. #### 公平调度

默认情况下，RabbitMQ将消息一股脑分配给消费者,不管消费者是否能够处理相应的消息，也不会管消费者是否响应。只是按照默认的顺序把当前所有消息发给消费者，等待这个消费者把所有消息处理完毕才给下一个消费者。

使用方法：` channel.basic_qos(prefetch_count=1)`使RabbitMQ在同一时间不要发送超过1条消息给同一个消费者，而是直到这个消费者将消息处理完毕并作出了响应，再将消息发给下一个空闲的消费者。

~~~python
import pika
import time

user_info = pika.PlainCredentials(username="guest", password="guest")
connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost",credentials=user_info))
channel = connection.channel()

channel.queue_declare(queue="hello")
current_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())


def callback(ch, method, properties, body):
    print("[消费者%s] Received %r" % (current_time,body))

    time.sleep(10)
    print("ok")
    ch.basic_ack(delivery_tag=method.delivery_tag)

    
channel.basic_qos(prefetch_count=1) 

channel.basic_consume(callback, queue="hello", no_ack=False)
print(' [%s] Waiting for messages. To exit press CTRL+C'%current_time)
channel.start_consuming()
~~~

