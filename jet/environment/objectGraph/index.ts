/**
 * @fileOverview 注册所有 dependencies
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import type { Dependencies } from '../../dependencies/makeDependencies'
import { AppObjectGraph } from './objectGraph'

export class WebObjectGraph extends AppObjectGraph {
  configureWithDependencies(dependencies: Dependencies) {
    const { client, console, metricsIdentifiers, net, memory, storage, user } = dependencies

    return this.addingClient(client)
      .addingNetwork(net)
      .addingConsole(console)
      .addingMetricsIdentifiers(metricsIdentifiers)
      .addingMemory(memory)
      .addingLocalStorage(storage.local)
      .addingSessionStorage(storage.session)
      .addingUser(user)
  }
}

export function makeObjectGraph(dependencies: Dependencies): WebObjectGraph {
  const objectGraph = new WebObjectGraph('web')
  return objectGraph.configureWithDependencies(dependencies)
}
