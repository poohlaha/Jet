# Jet

`Jet` 是一个 `运行时调度器(Runtime Dispatcher)`, 负责 `意图到页面` 的运行时, 它接收高层语义性的 `Intent`(比如 `导航到 /article` 或 `打开外部 URL`), 把 `Intent` 转成可执行的 `ActionModel`(或直接交给 `handler` 去做), 由注册的 `ActionDispatcher` 执行对应的 `handler`, `handler` 返回 `Page` (或另一个 `action`), 最终 `jet` 把这些 `Page` 提供给 `UI层` 渲染

## 实现原理
```
Jet
 ├── dispatch(intent)          ← 对外统一入口
 ├── onRoute(intent)           ← 路由专用入口
 ├── onAction(kind, impl)      ← 注册 action handler
 └── runtime.dispatch(intent)  ← 核心调度
        ↓
     ActionDispatcher.perform(action)
```
![](./jet.png)

## 执行过程
1. 路由
```
 goto(route)
     ↓
 jet.onRoute(intent)                      ← intent.kind = "RouteUrlIntent" {kind: 'RouteUrlIntent', payload: {route: '/about'}}
     ↓
 jet.dispatch(intent)                     ← 通过 dispatch 转发
     ↓
 runtime.dispatch(intent)                 ← 找到 controller(RouteUrlIntentController), 返回 externalUrlAtion
     ↓
 ActionDispatcher.perform(action)         ← 找到已注册的 handler(externalActionHandler)
      ↓
 externalActionHandler(...)               ← 调用 external-url-action.ts 中注册的处理器
     ↓
 metrics.asyncTime                        ← 记录 dispatch 性能时间
```

2. 事件
```
 perform(intent)
     ↓
 jet.dispatch(intent)                     ← intent.kind = "flowAction" {kind: 'flowAction', payload: {route: '/about'}}
     ↓
 ActionDispatcher.perform(action)         ← 找到已注册的 handler(flowActionHandler)
     ↓
 compoundActionHandler(...)                   ← 调用 compound-action.ts 中注册的处理器
     ↓
 metrics.asyncTime                        ← 记录 dispatch 性能时间
```

## 使用方法
1. 在项目中引入根目录下的 `bootstrap.ts`、`browser.ts`、`globalJet.ts`

2. 在项目启动时调用 `browser.ts` 中的 `startApplication` 方法, `startApplication` 中可以注入 `stores` 和 `navigate`
```ts
import { startApplication } from './browser'
import { STORES } from './stores'
const navigate = useNavigate()

useEffect(() => {
  startApplication(STORES, navigate)
}, [])
```

3. 使用
```ts
import { getJet } from './globalJet'

const Jet = getJet()

// 路由
Jet?.onRoute({
    $kind: 'RouteUrlIntent',
    payload: {
        route: '/xxx',
        replace: false
    }
})

// 事件
Jet?.perform(makeFlowIntent('/xxx', {id: 'xxx'}));

// 请求
Jet()?.dispatch<NetworkIntent>({
    $kind: 'NetworkIntent',
    payload: { ...(params || {}) }
})

```
