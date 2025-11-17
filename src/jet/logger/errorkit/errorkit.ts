/**
 * @fileOverview 使用 @sentry 自动上报日志
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type { Logger, LoggerFactory } from '../logger';
import { LOGGER_PREFIX_NAME } from '../../types';
import { ErrorHub } from './types';
import { SentryKitUserOptions } from '../../../sentrykit';

export type PartialSentryModule = {
	captureException: (err: any) => void;
	captureMessage: (msg: string, level?: any) => void;
	addBreadcrumb: (crumb: any) => void;
};

export type ErrorKitInstance = InstanceType<typeof ErrorKit>;

export const setupErrorKit = (
	config: SentryKitUserOptions,
	loggerFactory: LoggerFactory
): ErrorKitInstance | undefined => {
	if (typeof window === 'undefined') return;

	const log = loggerFactory.loggerFor(`${LOGGER_PREFIX_NAME} ErrorKit`);
	const BUILD_ENV = process.env.NODE_ENV;
	const isMultiDev = window.location.href.includes('multidev');
	const isErrorKitEnabled = BUILD_ENV === 'production' && !isMultiDev;

	const initializeErrorKit = async (): Promise<PartialSentryModule | null> => {
		let sentry: PartialSentryModule | null = null;
		if (isErrorKitEnabled) {
			try {
				const { createSentryConfig } = await import('../../../sentrykit');
				const Sentry = await import('@sentry/browser');
				Sentry.init(createSentryConfig(config));

				sentry = {
					addBreadcrumb: Sentry.addBreadcrumb,
					captureException: Sentry.captureException,
					captureMessage: Sentry.captureMessage
				};
			} catch (e) {
				log.error('something went wrong setting up errorKit', e);
			}
		}

		return sentry;
	};

	return new ErrorKit(initializeErrorKit(), log, isErrorKitEnabled);
};

class ErrorKit implements ErrorHub {
	private readonly sentry: Promise<PartialSentryModule | null>;
	private readonly logger: Logger;
	private readonly isErrorKitEnabled: boolean;

	constructor(
		sentry: Promise<PartialSentryModule | null>,
		log: Logger,
		isErrorKitEnabled: boolean
	) {
		this.sentry = sentry;
		this.logger = log;
		this.isErrorKitEnabled = isErrorKitEnabled;

		if (!isErrorKitEnabled) {
			log.debug('errorkit is disabled');
		}
	}

	async captureMessage(message: string): Promise<void> {
		if (!this.isErrorKitEnabled) return;

		const sentry = await this.sentry;
		if (sentry) {
			sentry.addBreadcrumb({
				category: 'log.warn',
				level: 'warning'
			});

			sentry.captureMessage(message, 'warning');
		} else {
			this.logger.warn(`${message} was not sent to errorKit`);
		}
	}

	async captureException(exception: Error): Promise<void> {
		if (!this.isErrorKitEnabled) return;

		const sentry = await this.sentry;
		if (sentry) {
			sentry.addBreadcrumb({
				type: 'error',
				category: 'error',
				level: 'error'
			});
			sentry.captureException(exception);
		} else {
			this.logger.warn(`The following exception was not sent to errorKit:`, exception);
		}
	}

	reportLocalLogs(): Promise<void> {
		// if (!this.isErrorKitEnabled) return
		return Promise.resolve(undefined);
	}
}
