// Configuration guide: https://rstack.rs/config
import { define } from 'rstack';
import { pluginPublint } from '../src/index.ts';

define.lib({
  format: 'esm',
  plugins: [pluginPublint()],
});
