/**
 * @fileOverview 错误日志属性
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
const APPS_PROD_SUBDOMAIN = ['apps'];
const PROJECT_ID = 'onyx_apps';

const getSentryEnv = () => {
    let location = ''
    if (typeof window !== 'undefined') {
        location = window.location.host.split('.')[0] || ''
    }

    return APPS_PROD_SUBDOMAIN.includes(location) ? 'prod' : 'dev';
};

export const ERROR_KIT_CONFIG = {
    project: PROJECT_ID,
    environment: '',
    release: '1.0',
};