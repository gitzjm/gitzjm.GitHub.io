---
layout: post
title: 'RebbitMQ-Python教程（2）'
subtitle: ''
date: 2018-03-05
categories: 技术
tags: RabbitMQ
---

在上篇教程中，我们搭建了一个工作队列，每个消息只分发给一个消费者。本篇教程中，我们要做的和之前完全不同——分发一个消息给多个消费者（consumers）

### 交换机（Exchanges）

前面的教程中，我们发送消息到队列中取出消息。现在是时候介绍RabbitMQ中完整的消息模型了。

简单概括一下之前的教程：

- 发布者（producer）是发布消息的应用程序。
- 队列（queue）用于消息存储的缓冲。
- 消费者（consumer）是接收消息的应用程序。

RabbitMQ消息模型的核心理念是：发布者不会直接发送任何消息给消息对别。事实上，发布者甚至不知道消息是否已经被投递到队列。

发布者只需要把消息发送给一个交换机（exchange）。交换机非常简单，它一边从发布者方接收消息，一遍把消息推送到队列。交换机必须知道如何处理它接收到的消息，是应该推送到指定的队列还是多个队列，或者是直接忽略消息。这些规则是通过交换机类型（exchange type）来定义的。

![img](http://www.rabbitmq.com/img/tutorials/exchanges.png)

交换机类型：

- 直连交换机（direct)
- 主题交换机（topic）
- 头交换机（headers）
- 扇形交换机（fanout）

### 发布/订阅（fanout）

![img](https://images2015.cnblogs.com/blog/425762/201607/425762-20160717140730998-2143093474.png)

发布订阅和简单的消息队列区别在于，发布订阅会将消息发送给所有的订阅者，而消息队列中的数据被消费一次便消失。所以，RabbitMQ实现发布和订阅时，会为每一个订阅者创建一个队列，而发布者发布消息时，会将消息放置在所有相关队列中。

```
exchange type = fanout
```



```python
# 生产者
#!/usr/bin/env python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()

#声明交换器，不允许发布消息到不存在的交换器
channel.exchange_declare(exchange='logs',
                         type='fanout')

message = ' '.join(sys.argv[1:]) or "info: Hello World!"
channel.basic_publish(exchange='logs',
                      routing_key='',
                      body=message)
print(" [x] Sent %r" % message)
connection.close()


# 消费者
#!/usr/bin/env python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='logs',
                         type='fanout')

result = channel.queue_declare(exclusive=True)
queue_name = result.method.queue

#绑定交换机和队列，现在logs交换机会把消息推送到这个队列中
channel.queue_bind(exchange='logs',
                   queue=queue_name)

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(" [x] %r" % body)

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()
```



###  关键字发送(direct)

![img](https://images2015.cnblogs.com/blog/425762/201607/425762-20160717140748795-1181706200.png)

```python
 exchange type = direct
```

之前事例，发送消息时明确指定某个队列并向其中发送消息，RabbitMQ还支持根据关键字发送，即：队列绑定关键字，发送者将数据根据关键字发送到消息exchange，exchange根据 关键字 判定应该将数据发送至指定队列。

```python
#!/usr/bin/env python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='direct_logs',
                         type='direct')

result = channel.queue_declare(exclusive=True)
queue_name = result.method.queue

severities = sys.argv[1:]
if not severities:
    sys.stderr.write("Usage: %s [info] [warning] [error]\n" % sys.argv[0])
    sys.exit(1)

for severity in severities:
    channel.queue_bind(exchange='direct_logs',
                       queue=queue_name,
                       routing_key=severity)

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(" [x] %r:%r" % (method.routing_key, body))

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()

```



###  模糊匹配(topic)

![img](https://images2015.cnblogs.com/blog/425762/201607/425762-20160717140807232-1395723247.png)

```python
 exchange type = topicp
```

| 发送者路由值（routing_key) | 队列的路由值 | 是否匹配 |
| :------------------------- | ------------ | -------- |
| zjm.aaa.python             | zjm.*        | 不匹配   |
| zjm.aaa.python             | zjm.#        | 匹配     |

在topic类型下，可以让队列绑定几个模糊的关键字，之后发送者将数据发送到exchange，exchange将传入”路由值“和 ”关键字“进行匹配，匹配成功，则将数据发送到指定队列。

- \# 表示可以匹配 0 个 或 多个 单词
- \*  表示只能匹配 一个 单词

 示例：



```python
#!/usr/bin/env python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='topic_logs',
                         type='topic')

result = channel.queue_declare(exclusive=True)
queue_name = result.method.queue

binding_keys = sys.argv[1:]
if not binding_keys:
    sys.stderr.write("Usage: %s [binding_key]...\n" % sys.argv[0])
    sys.exit(1)

for binding_key in binding_keys:
    channel.queue_bind(exchange='topic_logs',
                       queue=queue_name,
                       routing_key=binding_key)

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(" [x] %r:%r" % (method.routing_key, body))

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()

```