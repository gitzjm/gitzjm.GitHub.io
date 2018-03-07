---
layout: post
title: 'Redis-py API使用'
subtitle: '在Python中调用接口使用Redis'
date: 2018-03-02
categories: 技术
tags: Redis
---

## 概览

安装：` pip3 install redis`

文档：http://doc.redisfans.com/

API使用：

redis-py 的API的使用可以分类为：

- 连接方式
- 连接池
- 操作
  - String 操作
  - Hash 操作
  - List 操作
  - Set 操作
  - Sort Set 操作
- 管道
- 发布订阅



## 连接方式

redis-py提供两个类Redis和StrictRedis用于实现Redis的命令，StrictRedis用于实现大部分官方的命令，并使用官方的语法和命令，Redis是StrictRedis的子类，用于向后兼容旧版本的redis-py。

~~~Python
import redis
 
r = redis.Redis(host='10.211.55.4', port=6379)
r.set('foo', 'Bar')
print r.get('foo')
~~~

## 连接池

redis-py使用connection pool 来管理对一个个redis server的所有连接，避免每次建立、释放连接的开销。默认，每个Redis示例都会维护一个自己的连接池。可以建立一个连接池，然后作为参数Redis，这样就可以实现多个Redis实例共享一个连接池。

~~~ Python
import redis

pool = redis.ConnectionPool(host="127.0.0.1",port=6379)

r=redis.Redis(connection_pool=pool)
r.set('foo','bar')
print(r.get('foo'))
~~~



## 操作

#### String

String操作，Redis中的String在内存中按照一个name对应一个value来存储。如图：

![img](https://images2015.cnblogs.com/blog/425762/201602/425762-20160222213200645-359371350.png)

set(name, value, ex=None, px=None, nx=False, xx=False)

~~~ Python
在Redis中设置值，默认不存在创建，存在修改
参数：
	ex 过期时间(秒)
    px 过期时间(毫秒)
    nx 如果为True,则只有name不存在时，当前set操作才执行
    xx 如果为True,则只有name存在时，当前set操作才执行
~~~

setnx(name, value)
~~~ Python
设置值，只有name不存在时，执行设置操作(添加)
~~~

setex(name, value, time)
~~~ Python
设置值
参数：
	time 过期时间(数字秒 或 timedelta对象)
~~~

psetex(name, time_ms, value)
~~~ Python
设置值
参数：
	time_ms，过期时间(数字毫秒 或 timedelta对象)
~~~

mset(*args, **kwargs)
~~~ Python
批量设置值
如：
    mset(k1='v1', k2='v2')
    或
    mget({'k1': 'v1', 'k2': 'v2'})
~~~
get(name)
~~~ Python
获取值
~~~
mget(keys, *args)
~~~ Python
批量获取
如：
	mget("k1","k2")
~~~
getset(name, value)
~~~ Python
设置新值并获取原来的值
~~~
getrange(key, start, end)
~~~ Python
获取子序列(根据字节获取，非字符)
参数：
	key Redis的key
    start 起始字节(从0开始)
    end 结束字节
    # 汉字为3字节
~~~
setrange(name, offset, value)
~~~ Python
修改字符串内容，从指定字符串的索引开始向后替换(新值太长时，则向后添加)
参数：
	offset 字符串的索引(字节)
    value 要设置的值
~~~
setbit(name, offset, value)
~~~ Python
对name对应值得二进制表示的位进行操作
参数：
	offset 字符串的索引(转换成二进制之后索引)
    value 值只能是1或0
    
    注：如果在Redis中有一个对应： n1 = "foo"，
        那么字符串foo的二进制表示为：01100110 01101111 01101111
    所以，如果执行 setbit('n1', 7, 1)，则就会将第7位设置为1，
        那么最终二进制则变成 01100111 01101111 01101111，即："goo"
~~~
getbit(name, offset)
~~~ Python
获取name对应二进制表示中某位的值
~~~
bitcount(key, start=None, end=None)
~~~ Python
获取name对应的值得二进制表示中1的个数
参数：
	start 位置起始位置
    end 位置结束位置
~~~
bitop(operation, dest, *keys)
~~~ Python
获取多个值，并将值进行位运算，将最后的结果保存至新的name对应的值

参数：
	operation AND(与) OR(或) NOT(非) XOR(异或)
    dest 新的Redis的name
    *keys 要查找的redis 的name
    
    bitop("AND", 'new_name', 'n1', 'n2', 'n3')
    # 获取Redis中n1,n2,n3对应的值，然后讲所有的值做位运算（求并集），然后将结果保存 new_name 对应的值中
~~~
strlen(name)
~~~ Python
返回name对应值得字节长度
~~~
incr(name, amount=1)
~~~ Python
自增name对应的值，当name不存在时，则创建name=amount,否则则自增

参数:
	name redis的name
    amount 自增数(必须为整数)
~~~
incrbyfloat(name, amount=1.0)
~~~ Python
自增name对应的值，当name不存在时，则创建name=amount,否则则自增

参数：
	name redis的name
    amount 自增数(浮点型)
~~~
decr(self, name, amount=1)
~~~ Python
自减name对应的值，当name不存在时，则创建name=amount,否则则自增

参数：
	self:不知道有啥用。
	name redis的name
    amount 自减数(整型)
~~~
append(key, value)
~~~ Python
在key对应值得后面追加内容
参数
	key Redis的name
    value 要追加的字符串
~~~

#### Hash

Hash操作，redis中Hash在内存中的存储格式如下图：

![img](https://images2015.cnblogs.com/blog/425762/201602/425762-20160223115506630-113443460.png)



hset(name, key, value)

~~~Python
name 对应的hash中设置一个键值对(不存在创建，存在修改)

参数：
	name redis的name
    key name对应hash中的key
    value name对应hash中key对应的value
~~~

hmset(name, mapping)
~~~Python
在name对应的hash中批量设置键值对

参数：
	name Redis的name
    mapping 字典
~~~


hget(name,key)
~~~Python
在name对应的hash中获取key所对应的value
~~~
hmget(name, keys, *args)
~~~Python
在name对应的hash中获取多个key的值
参数：
	name redis对应的name
    key 要获取key的集合,如 ['k1','k2','k3']
    *arge 要获取的key,如 k1,k2,k3
    
例：
	r.mget('xx',['k1','k2','k3'])
    r.mget('xx',k1,k2,k3)
~~~
hgetall(name)
~~~Python
获取name对应的hash的所有键值
~~~
hlen(name)
~~~Python
获取name对应的hash中键值对的个数
~~~
hkeys(name)
~~~Python
获取name对应hash中所有的key值
~~~
hvals(name)
~~~Python
获取name对应的hash中所有的value值
~~~
hexists(name, key)
~~~Python
检查name对应的hash是否存在当前传入的key值
~~~
hdel(name,*keys)
~~~Python
将name对应的hash中指定的key的键值对删除
~~~
hincrby(name, key, amount=1)
~~~Python
自增name对应的hash中指定的key的value值，不存在的创建key=amount
参数：
	name：Redis中的name
    key：hash对应的key
    amount：自增数(整型)
~~~
hincrbyfloat(name, key, amount=1.0)
~~~Python
自增name对应的hash中指定的key的value值，不存在的创建key=amount
参数：
	name：Redis中的name
    key：hash对应的key
    amount：自增数(浮点型)
~~~
hscan(name, cursor=0, match=None, count=None)
~~~Python
增量迭代式获取，对于数据量大的数据非常有用，hscan可以实现分片式的获取数据，并非一次性将数据全部获取完，从而防止爆内存

参数
	name：Redis的name
    cursor：游标(基于游标分批获取数据)
    match：匹配指定key默认None 表示所有Key
    count:每次分片最少获取个数，默认None表示采用Redis默认的分片个数
        
~~~
hscan_iter(name, match=None, count=None)
~~~Python
利用yield封装hscan创建生成器，实现分批去Redis中获取数据

参数：
	match：匹配指定key，默认None表示所有的key
    count：每次分片最少获取个数，默认None表示采用Redis的默认分片个数
例：
如：
    for item in r.hscan_iter('xx'):
        print item
~~~

#### List

List操作，redis中的List在在内存中按照一个name对应一个List来存储。如图：

![img](https://images2015.cnblogs.com/blog/425762/201602/425762-20160223172249115-189393001.png)

lpush(name,values)

~~~python
在name对应的list中添加元素，每个新的元素都添加在列表的最左边
#rpush(name,value) 表示从右向左操作
~~~



lpushx(name,value)
~~~python
在name对应的list中添加元素，只有name已经存在时，值添加到列表的最左边
#rpushx(name,value) 表示从右向左操作
~~~
llen(name)
~~~python
name对应list元素的个数
~~~
linsert(name, where, refvalue, value))
~~~python
在name对应的列表的某一个值前或后插入一个新值

参数：
	name：Redis的name
    where：BEFORE或AFTER
    refvalue：标杆值，即在它前后插入数据
    value：要插入的数据
~~~
r.lset(name, index, value)
~~~python
对name对应的list中的某一个索引位重新赋值
参数
	name：Redis的name
    index：list的索引位置
    value：要设置的值
~~~
r.lrem(name, value, num)
~~~python
在name对应的list中删除指定的值

参数：
	name：Redis的name
    value：要删除的值
    num：nun=0 删除所有指定的值
    	 num=2 从前到后，删除1个
         num=-2 从后道歉，删除2个
~~~
lpop(name)
~~~python
在name对应的列表的左侧获取第一个元素并在列表中删除，返回值是左侧第一个元素
#rpop(name)表示从右向左操作
~~~
lindex(name, index)
~~~python
在name对应的列表中根据索引获取列表元素
~~~
lrange(name, start, end)
~~~python
在name对应的列表分片获取数据

参数：
	name：Redis的name
    start：索引的起始位置
    end：索引的结束位置
~~~
ltrim(name, start, end)
~~~python
在name对应的列表中移除没有在start-end索引之间的值

参数：
	name：Redis的name
    start：索引的起始位置
    end：索引的结束为止
~~~
rpoplpush(src, dst)
~~~python
从一个列表取出最右边的元素，同时将其添加至另一个列表的最左边

参数：
	src:要取数据的列表的name
    dst:要添加数据的列表的name
~~~
blpop(keys, timeout)
~~~python
将多个列表排列，按照从左到右去pop对应列表的元素
参数：
	keys：redis的name的集合
    timeout：超时时间，当元素所有列表的元素获取完之后，阻塞等待列表内有数据的时间(秒)，0表示永远阻塞
~~~
brpoplpush(src, dst, timeout=0)
~~~python
从一个列表的右侧移除一个元素并将其添加到另一个列表的左侧
 
参数：
    src，取出并要移除元素的列表对应的name
    dst，要插入元素的列表对应的name
    timeout，当src对应的列表中没有数据时，阻塞等待其有数据的超时时间（秒），0 表示永远阻塞

~~~
自定义增量迭代

~~~python
# 由于redis类库中没有提供对列表元素的增量迭代，如果想要循环name对应的列表的所有元素，那么就需要：
    # 1、获取name对应的所有列表
    # 2、循环列表
# 但是，如果列表非常大，那么就有可能在第一步时就将程序的内容撑爆，所有有必要自定义一个增量迭代的功能：
 
def list_iter(name):
    """
    自定义redis列表增量迭代
    :param name: redis中的name，即：迭代name对应的列表
    :return: yield 返回 列表元素
    """
    list_count = r.llen(name)
    for index in xrange(list_count):
        yield r.lindex(name, index)
 
# 使用
for item in list_iter('pp'):
    print item
~~~

### Set

Set集合就是不允许重复的列表

sadd(name,values)

~~~python
给name集合添加元素set
~~~

scard(name)

~~~python
获取name对应集合中元素的个数
~~~
sdiff(keys, *args)

~~~python
在第一个key对应集合中且不在其他集合中的元素的集合(从左到右算差集)
~~~
sdiffstore(dest, keys, *args)

~~~python
计算差集放到dist集合中
~~~
sinter(keys, *args)

~~~python
返回给定所有集合的交集
~~~
sinterstore(dest, keys, *args)

~~~python
返回交集并存储在dest中
~~~
sismember(name, value)

~~~python
判断value元素是否是集合name的成员，返回布尔值
~~~
smembers(name)

~~~python
返回集合中所有元素值得puthon集合类型元素
~~~
smove(src, dst, value)

~~~python
将元素value从src集合移动到dst集合，若src中没有，则会在dst添加
~~~
spop(name)

~~~python
移除并返回集合中随机的一个元素
~~~
srandmember(name, numbers)

~~~python
从name对应的集合中随机获取numbers个元素
~~~
srem(name, values)

~~~python
在name对应的集合中删除值
~~~
sunion(keys, *args)

~~~python
获取多个集合的并集
~~~
sunionstore(dest,keys, *args)

~~~python
获取并集并保存到dest中
~~~
sscan(name, cursor=0, match=None, count=None)

sscan_iter(name, match=None, count=None)

~~~python
同HASH
~~~
### SortSet

在集合的基础上为元素排序，元素的排序需要根据另外一个值来进行比较，所以，对于有序集合，每一个元素有两个值，即：值和分数，分数专门用来排序

zadd(name, *args, **kwargs)

~~~python 
在name对应的有序集合中添加元素
~~~

zcard(name)

~~~python
获取name对应的有序集合的元素数量
~~~



zcount(name, min, max)
~~~python
获取对应有序集合中分数在[min,max]之间的个数
~~~
zincrby(name, value, amount)
~~~python
自增name对应的有序集合的name对应的分数
~~~
r.zrange( name, start, end, desc=False, withscores=False, score_cast_func=float)
~~~python
# 按照索引范围获取name对应的有序集合的元素
 
# 参数：
    # name，redis的name
    # start，有序集合索引起始位置（非分数）
    # end，有序集合索引结束位置（非分数）
    # desc，排序规则，默认按照分数从小到大排序
    # withscores，是否获取元素的分数，默认只获取元素的值
    # score_cast_func，对分数进行数据转换的函数
 
# 更多：
    # 从大到小排序
    # zrevrange(name, start, end, withscores=False, score_cast_func=float)
 
    # 按照分数范围获取name对应的有序集合的元素
    # zrangebyscore(name, min, max, start=None, num=None, withscores=False, score_cast_func=float)
    # 从大到小排序
    # zrevrangebyscore(name, max, min, start=None, num=None, withscores=False, score_cast_func=float)
~~~
zrank(name, value)
~~~python
# 获取某个值在 name对应的有序集合中的排行（从 0 开始）
 
# 更多：
    # zrevrank(name, value)，从大到小排序
~~~
zrangebylex(name, min, max, start=None, num=None)
~~~python
# 当有序集合的所有成员都具有相同的分值时，有序集合的元素会根据成员的 值 （lexicographical ordering）来进行排序，而这个命令则可以返回给定的有序集合键 key 中， 元素的值介于 min 和 max 之间的成员
# 对集合中的每个成员进行逐个字节的对比（byte-by-byte compare）， 并按照从低到高的顺序， 返回排序后的集合成员。 如果两个字符串有一部分内容是相同的话， 那么命令会认为较长的字符串比较短的字符串要大
 
# 参数：
    # name，redis的name
    # min，左区间（值）。 + 表示正无限； - 表示负无限； ( 表示开区间； [ 则表示闭区间
    # min，右区间（值）
    # start，对结果进行分片处理，索引位置
    # num，对结果进行分片处理，索引后面的num个元素
 
# 如：
    # ZADD myzset 0 aa 0 ba 0 ca 0 da 0 ea 0 fa 0 ga
    # r.zrangebylex('myzset', "-", "[ca") 结果为：['aa', 'ba', 'ca']
 
# 更多：
    # 从大到小排序
    # zrevrangebylex(name, max, min, start=None, num=None)
~~~
zrem(name, values)
~~~python
# 删除name对应的有序集合中值是values的成员
 
# 如：zrem('zz', ['s1', 's2'])

~~~
zremrangebyrank(name, min, max)
~~~python
根据排行范围删除
~~~
zremrangebyscore(name, min, max)
~~~python
根据分数范围删除
~~~
zremrangebylex(name, min, max)
~~~python
根据返回值删除
~~~
zscore(name, value)
~~~python
获取name对应有序集合中value对应的分数
~~~
zinterstore(dest, keys, aggregate=None)
~~~python
获取两个有序集合的交集，如果遇到相同值不同分数，则按照aggregate进行操作
aggregate的值为：SUM MIN MAX
~~~
zunionstore(dest, keys, aggregate=None)
~~~python
获取两个有序集合的并集，如果遇到相同值不同分数，则按照aggregate进行操作
aggregate的值为：SUM MIN MAX
~~~
zscan(name, cursor=0, match=None, count=None, score_cast_func=float)
zscan_iter(name, match=None, count=None,score_cast_func=float)
~~~python
同字符串相似，相较于字符串新增score_cast_func，用来对分数进行操作
~~~
### 其他常用操作

delete(*names)

~~~python
根据names删除redis中的任意数据类型
~~~

exists(name)

~~~python
检测redis的name是否存在
~~~
keys(pattern='*')

~~~python
根据模型获取redis的name
~~~
expire(name ,time)

~~~python
为某个redis的某个name设置超时时间
~~~
rename(src, dst)

~~~python
对redis的name重命名
~~~
move(name, db))

~~~python
将redisde 某个值移动到指定db下
~~~
randomkey()

~~~python
随机获取一个redis的name
~~~
type(name)

~~~python
获取name 对应值得类型
~~~
scan(cursor=0, match=None, count=None)
scan_iter(match=None, count=None)

~~~python
同字符串操作
~~~


### 管道

redis-py默认在执行每次请求都会创建（连接池申请连接）和断开（归还连接池）一次连接操作，如果想要在一次请求中指定多个命令，则可以使用pipline实现一次请求指定多个命令，并且默认情况下一次pipline 是原子性操作。

~~~Python
import redis
 
pool = redis.ConnectionPool(host='10.211.55.4', port=6379)
 
r = redis.Redis(connection_pool=pool)
 
# pipe = r.pipeline(transaction=False)
pipe = r.pipeline(transaction=True)
 
pipe.set('name', 'alex')
pipe.set('role', 'sb')
 
pipe.execute()
~~~

### 发布订阅![img](https://images2015.cnblogs.com/blog/425762/201601/425762-20160121152411125-1838441844.png)

发布者：服务器

订阅者：Dashboad和数据处理



demo:

~~~python
import redis


class RedisHelper:

    def __init__(self):
        self.__conn = redis.Redis(host='10.211.55.4')
        self.chan_sub = 'fm104.5'
        self.chan_pub = 'fm104.5'

    def public(self, msg):
        self.__conn.publish(self.chan_pub, msg)
        return True

    def subscribe(self):
        pub = self.__conn.pubsub()
        pub.subscribe(self.chan_sub)
        pub.parse_response()
        return pub
~~~

订阅者

~~~python
from monitor.RedisHelper import RedisHelper
 
obj = RedisHelper()
redis_sub = obj.subscribe()
 
while True:
    msg= redis_sub.parse_response()
    print msg
~~~

发布者

~~~python

from monitor.RedisHelper import RedisHelper
 
obj = RedisHelper()
obj.public('hello')
~~~



