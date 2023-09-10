const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');

module.exports = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/topic_modeler.js',
      format: 'iife',
      name: 'TopicModeler',
      exports: 'named',
      globals: {
        'a-trie-grows-in-js': 'js-trie',
        'arrset/dist/flexible': 'arrset',
      },
      sourcemap: true,
    },
    plugins: [
      typescript({ compilerOptions: { module: 'CommonJS' } }),
      commonjs({ extensions: ['.js', '.ts'] }),
      nodeResolve(),
    ],
  },
];
