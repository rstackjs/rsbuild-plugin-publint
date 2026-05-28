import fs from 'node:fs/promises';
import { join } from 'node:path';
import { styleText } from 'node:util';
import { type RsbuildPlugin, logger } from '@rsbuild/core';
import type { Options } from 'publint';

type MessageColor = 'red' | 'yellow' | 'cyan';

const formatCountMessage = (
  color: MessageColor,
  count: number,
  singular: string,
  plural: string,
) =>
  [
    styleText(color, 'Publint found '),
    styleText([color, 'bold'], String(count)),
    styleText(color, ` ${count === 1 ? singular : plural}:`),
  ].join('');

export type PluginPublintOptions = {
  /**
   * Whether to enable publint.
   * @default true
   */
  enable?: boolean;
  /**
   * Options for publint.
   * @see https://github.com/bluwy/publint/blob/master/pkg/README.md#api
   */
  publintOptions?: Options;
  /**
   * Specify when to throw an error based on message severity.
   * - 'error': Only throw on errors (default)
   * - 'warning': Throw on errors and warnings
   * - 'suggestion': Throw on errors, warnings and suggestions
   * - 'never': Never throw an error
   * @default 'error'
   */
  throwOn?: 'error' | 'warning' | 'suggestion' | 'never';
};

export const pluginPublint = (
  options: PluginPublintOptions = {},
): RsbuildPlugin => ({
  name: 'plugin-publint',

  setup(api) {
    const { enable = true, throwOn = 'error' } = options;

    if (!enable) {
      return;
    }

    api.onAfterBuild({
      handler: async ({ isFirstCompile, isWatch }) => {
        // Only run on the first compile in watch mode, or on a single build
        if (!isFirstCompile) {
          return;
        }

        const { publint } = await import('publint');
        const { formatMessage } = await import('publint/utils');

        const mergedOptions = {
          pkgDir: api.context.rootPath,
          ...options.publintOptions,
        };
        const { messages } = await publint(mergedOptions);

        const pkg = JSON.parse(
          await fs.readFile(join(mergedOptions.pkgDir, 'package.json'), 'utf8'),
        );

        const formatted: Record<string, (string | undefined)[]> = {
          errors: [],
          warnings: [],
          suggestions: [],
        };

        for (const message of messages) {
          if (message.type === 'error') {
            formatted.errors.push(formatMessage(message, pkg));
          } else if (message.type === 'warning') {
            formatted.warnings.push(formatMessage(message, pkg));
          } else {
            formatted.suggestions.push(formatMessage(message, pkg));
          }
        }

        if (
          formatted.errors.length === 0 &&
          formatted.warnings.length === 0 &&
          formatted.suggestions.length === 0
        ) {
          logger.info(styleText('green', 'Publint passed.'));
        }

        const errorsCount = formatted.errors.length;
        if (errorsCount > 0) {
          logger.error(
            formatCountMessage('red', errorsCount, 'error', 'errors'),
          );
          for (const message of formatted.errors) {
            if (message) {
              logger.error(message);
            }
          }
          // empty line
          console.log();
        }

        const warningsCount = formatted.warnings.length;
        if (warningsCount > 0) {
          logger.warn(
            formatCountMessage('yellow', warningsCount, 'warning', 'warnings'),
          );
          for (const message of formatted.warnings) {
            if (message) {
              logger.warn(message);
            }
          }
          // empty line
          console.log();
        }

        const suggestionsCount = formatted.suggestions.length;
        if (suggestionsCount > 0) {
          logger.info(
            formatCountMessage(
              'cyan',
              suggestionsCount,
              'suggestion',
              'suggestions',
            ),
          );
          for (const message of formatted.suggestions) {
            if (message) {
              logger.info(message);
            }
          }
        }

        const shouldThrow = () => {
          switch (throwOn) {
            case 'suggestion':
              return (
                formatted.suggestions.length > 0 ||
                formatted.warnings.length > 0 ||
                formatted.errors.length > 0
              );
            case 'warning':
              return (
                formatted.warnings.length > 0 || formatted.errors.length > 0
              );
            case 'error':
              return formatted.errors.length > 0;
            case 'never':
              return false;
          }
        };

        if (shouldThrow() && !isWatch) {
          throw new Error('Publint failed!');
        }
      },
      order: 'post',
    });
  },
});
