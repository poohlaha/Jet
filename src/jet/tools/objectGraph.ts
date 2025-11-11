/**
 * @fileOverview 注册中心
 * @date 2025-11-07
 * @author poohlaha
 * @description 提供一个非常小的依赖注入容器（ObjectGraph），能注册 factory（延迟实例化）或实例，并能 resolve（包含异步 factory 支持）, 可以实现作用域（scoped DI）、生命周期（init/teardown）、依赖关系验证等
 */

type Factory<T> = () => T | Promise<T>;

export class ObjectGraph {
  private registry = new Map<string, any | Factory<any>>();

  // 直接注册实例
  registerInstance<T>(key: string, instance: T) {
    this.registry.set(key, instance);
  }

  // 将工厂函数注册到容器，不立即调用（惰性实例化）
  registerFactory<T>(key: string, factory: Factory<T>) {
    this.registry.set(key, factory);
  }

  // 如果 registry 中的 value 是函数，则调用它（await 结果），然后把结果缓存回 registry（避免重复创建），并返回实例；否则直接返回实例
  async resolve<T>(key: string): Promise<T> {
    if (!this.registry.has(key)) throw new Error(`Dependency not found: ${key}`);
    const value = this.registry.get(key);
    if (typeof value === 'function') {
      const inst = await (value as Factory<T>)();
      this.registry.set(key, inst); // cache
      return inst;
    }
    return value as T;
  }
}

