# 基于NodeJs 和 express 框架的服务端
* 使用mongoDB数据库，引入mongoose对数据库进行操作
* 一个简陋的招聘App注册与登录，以及注销功能，密码均使用MD5加密
* 在线聊天功能，可发送表情以及显示未读消息等要素
* 默认端口：5000
* 数据库约束，以及字段

  用户数据Schema:   users
  |    字段名    | 字段类型 | 是否必要 |
  | :----------: | :------: | :------: |
  |   username   |  String  |    是    |
  |   password   |  String  |    是    |
  |   useType    |  String  |    否    |
  |    avatar    |  String  |    否    |
  |   position   |  String  |    否    |
  | personalInfo |  String  |    否    |
  | companyInfo  |  String  |    否    |
  |    salary    |  String  |    否    |

  聊天数据Schema:   chat
  |   字段名    | 字段类型 |  是否必要   |
  | :---------: | :------: | :---------: |
  |   from_id   |  String  |     是      |
  |    to_id    |  String  |     是      |
  |   chat_id   |  String  |     是      |
  |   content   |  String  |     是      |
  |   hasRead   | Boolean  | 默认为false |
  | create_time |  Number  |     否      |
    * from_id 发送者id
    * to_id 接受者id
    * chat_id 聊天会话id，由发送接受者共同决定
    * content 聊天内容
    * hasRead 对方是否已读
    * create_time 创建时间，排序使用
* 接口（API）：
  * 用户注册接口
    * 路径：/register
    * 请求方式：POST
    * 接收参数：
      * username 
      * password
      * userType
    * 注册成功：返回数据，并且设置cookie为数据库生成的用户id
      ```js
      {code:0,data:{ _id:'xxx', username:'xxx'}}
      ```
    * 注册失败：返回
      ```js
      {code:1,msg: '用户名已存在，或不可使用'}
      ```
  * 用户登陆接口
    * 路径：/login
    * 请求方式：POST
    * 接收参数：
      * username
      * password
    * 登陆成功：返回数据，并且设置cookie为数据库生成的用户id
      ```js
      {code:0,data:userDoc}
      ```
    * 登陆失败：返回
      ```js
      {code:1,msg:'用户名或密码错误'}
      ```
  * 更新用户信息接口
    * 路径：/update-user-data
    * 请求方式：POST
    * 接收参数：
      * name 真实姓名
      * avatar 头像信息
      * position 职位信息（老板）
      * personalInfo 职位要求、个人简介
      * companyInfo 公司信息 （老板）
      * salary 薪资信息（老板）
    * cookie不存在，返回
      ```js
      {code:1,msg:'请先登录'}
      ```
    * 更新成功：
      ```js
      {code:0,data:user}
      ```
    * id查找到的信息不存在，更新失败，返回
      ```js
      {code:1,msg:'请先登录'}
      ```
  * 获取用户信息接口（自动登录）
    * 路径：/get-user-data
    * 请求方式：GET
    * 接收参数：
      * userId cookie中的userId
    * 找不到userId 对应的用户信息，返回
      ```js
      {code:1,msg:'请先登录'}
      ```
    * 找到了，并且返回userId对应的用户信息
      ```js
      {code:0,data:user}
      ```
  

  * 获取用户列表
    * 路径：/get-user-list
    * 请求方式：GET
    * 接收参数：
      * userType
    * 没有信息返回，返回：
      ```js
      {code:1,msg:'当前无内容'}
      ```
    * 寻找到信息，返回：
      ```js
      {
          "code": 0,
          "data": [
              {
                  "_id": "5f363a7e0b93af2588198b06",
                  "userType": "boss",
                  "username": "用户名",
                  "avatar": "头像信息",
                  "companyInfo": "信息",
                  "name": "老板1",
                  "personalInfo": "职位信息",
                  "position": "职位信息",
                  "salary": "没有工资"
              },
              {
                  "_id": "5f393fa9c60c230788b6081d",
                  "userType": "boss",
                  "username": "12121212211",
                  "avatar": "icon-1",
                  "companyInfo": "我怎么知道",
                  "name": "张三",
                  "personalInfo": "个人信息",
                  "position": "职位信息",
                  "salary": "没有工资"
              }
          ]
      }
      ```
  * 聊天接口
    * 获取当前用户所有聊天信息列表
      * 路径：/get-msg-list
      * 请求方式：GET
      * 接收参数：无
      * 返回：
        * 所有用户的id，姓名以及头像信息，因为不能确定向某个用户发送信息，使用用户的id作为对象属性名
        * 当前用户与某个用户的聊天信息数据结构,chatMessages 为数组类型，内部包含多个聊天信息对象
        ```js
        {
            "code": 0,
            "data": {
                "users": {
                    "5f378752513bb725bc69278e": {
                        "name": "李强",
                        "avatar": "icon-1"
                    },
                    //...
                },
                "chatMessages": [
                    {
                        "hasRead": true,
                        "_id": "5f3c0595e936c53e60a5001c",
                        "from_id": "5f378752513bb725bc69278e",
                        "to_id": "5f363a7e0b93af2588198b06",
                        "content": "你好😃",
                        "chat_id": "5f363a7e0b93af2588198b06_5f378752513bb725bc69278e",
                        "create_time": "1597769109868"
                    },
                    //...
                ]
            }
        }
        ```
    * 修改指定消息为已读
      * 路径：/has-read-msg
      * 请求方式：POST
      * 接收参数：from_id
        * from_id 当前消息列表中对方的id
        * 在点击未读消息时，客户端向服务器发起当前请求，修改
      * 返回：
        * ```js
          {code: 0,data: count // count返回修改的条目总数}
          ```
    * socket.io接口
      * url: ws://localhost:5000
      * 客户端使用单例模式进行监听
