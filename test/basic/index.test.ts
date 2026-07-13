import { stripVTControlCharacters as stripAnsi } from 'node:util';
import { expect, test } from '@rstest/playwright';
import { createRsbuild } from '@rsbuild/core';
import { pluginPublint } from '../../src';
import { proxyConsole } from '@rstackjs/test-utils';

const getPublintLogs = (logs: string[]) => {
  const result: string[] = [];

  for (const log of logs) {
    if (log && (log.includes('Publint') || result.length > 0)) {
      result.push(stripAnsi(log));
    }
  }
  return result;
};

const allLogs = [
  'error   Publint found 3 errors:',
  'error   pkg.exports["."].types should be the first in the object as conditions are order-sensitive so it can be resolved by TypeScript.',
  'error   pkg.exports["."].import is ./dist/index.js but the file does not exist.',
  'error   pkg.exports["."].types is ./dist/index.d.ts but the file does not exist.',
  'info    Publint found 2 suggestions:',
  'info    The package does not specify the "type" field. Node.js may attempt to detect the package type causing a small performance hit. Consider adding "type": "commonjs".',
  `info    pkg.repository.url is git@github.com:test/test.git but could be a full git URL like "git+ssh://git@github.com/test/test.git".`,
];

test('should run publint as expected', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginPublint()],
    },
  });

  await expect(rsbuild.build()).rejects.toThrowError('Publint failed!');

  expect(getPublintLogs(logs)).toEqual(allLogs);
  restore();
});

test('should allow to pass publint options', async () => {
  const { logs, restore } = proxyConsole();

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginPublint({
          publintOptions: {
            level: 'error',
          },
        }),
      ],
    },
  });

  await expect(rsbuild.build()).rejects.toThrowError('Publint failed!');

  expect(getPublintLogs(logs)).toEqual(allLogs.slice(0, 4));
  restore();
});

test('should allow to disable publint', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginPublint({
          enable: false,
        }),
      ],
    },
  });

  await expect(rsbuild.build()).resolves.toBeTruthy();
});

test('should allow to disable throw', async () => {
  const { logs, restore } = proxyConsole();
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginPublint({
          throwOn: 'never',
        }),
      ],
    },
  });

  await expect(rsbuild.build()).resolves.toBeTruthy();

  expect(getPublintLogs(logs)).toEqual(allLogs);
  restore();
});
