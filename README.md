# Jet
`Jet` 是一个负责 `意图到页面` 的运行时, 它接收高层语义性的 `Intent`(比如 `导航到 /article` 或 `打开外部 URL`), 把 `Intent` 转成可执行的 `ActionModel`(或直接交给 `handler` 去做), 由注册的 `ActionDispatcher` 执行对应的 `handler`, `handler` 返回 `Page` (或另一个 `action`), 最终 `jet` 把这些 `Page` 提供给 `UI层` 渲染

## 实现原理
`Intent → dispatch → action → handler → Page → UI`
![](./jet.png)