# SentryKit

1. 项目结构

```
├── __test__                                         // 单元测试目录
│── privacy                                          // 数据隐私裁剪层(Safety Layer)
│   ├── rules.ts                                     // 隐私规则定义与实现
│   ├── settings.ts                                  // 隐私开关、选项、策略
│   └── type.ts                                      // 所有隐私配置的类型声明
├── transports                                       // 低层网络传输模块
│   ├── base.ts                                      // 基类 Transport 定义
│   │── fetch.ts                                     // fetch 实现
│   │── types.ts                                     // Transport 的类型声明
│   │── utils.ts                                     // 请求封装，body 序列化等
│   │── xhr.ts                                       // XMLHttpRequest 实现
│   └── index.ts                                     // 选取 Transport（fetch/xhr/native）工厂层
├── config.ts                                        // SDK 配置合并层(Options Layer)
├── ingestion-event.ts                               // Envelope → upload event 转换层
├── logger.ts                                        // 内部调试日志层
├── types.ts                                         // SDK 类型
├── utils.ts                                         // SDK 通用工具方法层
├── index.ts                                         // SDK 输出入口
└── README.md                                        // 项目使用说明文件
```

2. 实现过程
   ```
   createSentryConfig → SentryKit.init → Hub 绑定 client → beforeSend|beforeSendTransaction|beforeBreadcrumb → makeTransport
   1. createSentryConfig 返回完整配置
   2. SentryKit.init SDK 初始化 client + hub
   3. Hub 绑定 client → SentryKit 校验配置
   4. 事件捕获:
      - SDK 收集事件/transaction/breadcrumb(captureException / captureMessage / startTransaction → finish())
        - hub.captureEvent(event, hint)
        - hub.captureTransaction(transaction, hint)
      - 调用 beforeBreadcrumb, beforeSend, beforeSendTransaction
      - 调用 Transport 发送
        - getRequest(envelope) → 事件脱敏、打包
        - fetch/XHR → 发送到 ingest
        - 更新 rate-limits / buffer / 异常处理
   
   SentryKit 主要做三件事:
   - 配置校验与安全包装
   - 隐私脱敏与规则过滤
   - Transport 封装(fetch/XHR) + 队列/限流处理
   
   makeTransport:
      - 检查 envelope SDK 版本兼容性
      - 转成 ingestion events
      - 执行 processForPrivacy 隐私规则
      - 确定 topic（traces / error）
      - 构建 HTTP 请求对象
      - 调用 fetch 或 XHR 发请求
   ```