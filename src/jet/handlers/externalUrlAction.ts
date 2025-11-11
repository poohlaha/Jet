/**
 * @fileOverview 处理 externalUrlAction
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */

import {Dependencies} from "../types";

export function registerHandler(dependencies: Dependencies) {
    const { jet, logger } = dependencies;

    const log = logger.loggerFor('jet/handlers/externalUrlAction')

    /*
    jet.onAction('ExternalUrlAction', async (action: any) => {
        logger.info('received external URL action:', action);
        return 'performed';
    });
     */
}