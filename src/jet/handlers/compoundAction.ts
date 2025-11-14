/**
 * @fileOverview 执行多个子 action
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { Dependencies } from '../types';

export async function registerHandler(dependencies: Dependencies) {
	const { jet, logger } = dependencies;

	const log = logger.loggerFor('jet/handlers/compoundAction');

	/*
    jet.onAction('compoundAction', async (action: any) => {
        log.info('received CompoundAction:', action);

        const { subactions = [] } = action;

        // Perform actions in sequence
        for (const action of subactions) {
            await jet.perform(action).catch((e) => {
                // Throwing error stops for...of execution
                // TODO: rdar://73165545 (Error Handling Across App)
                throw new Error(
                    `an error occurred while handling CompoundAction: ${e}`,
                );
            });
        }

        return PERFORMED;
    });
     */
}
