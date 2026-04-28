# rsbuild-plugin-publint

Run [publint](https://github.com/bluwy/publint) to lint npm packages after the build.

<p>
  <a href="https://npmjs.com/package/rsbuild-plugin-publint">
   <img src="https://img.shields.io/npm/v/rsbuild-plugin-publint?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/rsbuild-plugin-publint?minimal=true"><img src="https://img.shields.io/npm/dm/rsbuild-plugin-publint.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Preview

`rsbuild-plugin-publint` is the perfect partner for [Rslib](https://github.com/web-infra-dev/rslib). When building a library, publint helps you to lint the npm package and give suggestions to improve its compatibility with different environments.

![Preview](https://github.com/user-attachments/assets/bb6940df-ab15-4155-bdf5-03b7bae5458f)

## Usage

Install:

```bash
npm add rsbuild-plugin-publint -D
```

Add plugin to your `rslib.config.ts` or `rsbuild.config.ts`:

```ts
import { pluginPublint } from 'rsbuild-plugin-publint';

export default {
  plugins: [pluginPublint()],
};
```

## Options

### enable

Whether to enable publint.

- Type: `boolean`
- Default: `true`

For example, only run publint in the CI environment:

```ts
pluginPublint({
  enable: Boolean(process.env.CI),
});
```

### publintOptions

Options for publint. See [publint - API](https://github.com/bluwy/publint/blob/master/pkg/README.md#api) for more details.

- Type: `import('publint').Options`
- Default:

```js
const defaultOptions = {
  pkgDir: api.context.rootPath,
};
```

- Example:

```js
pluginPublint({
  publintOptions: {
    level: 'error',
  },
});
```

### throwOn

Specify when to throw an error based on message severity.

- Type: `'error' | 'warning' | 'suggestion' | 'never'`
- Default: `'error'`
- Example:

```ts
pluginPublint({
  throwOn: 'warning',
});
```

Optional values:

- `'error'`: Only throw on errors.
- `'warning'`: Throw on errors and warnings.
- `'suggestion'`: Throw on errors, warnings and suggestions.
- `'never'`: Never throw an error.

:::warning
When running in watch mode, this plugin will print the error instead of throwing it.
:::

## License

[MIT](./LICENSE).
