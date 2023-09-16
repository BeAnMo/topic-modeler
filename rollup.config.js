const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');

module.exports = [
  {
<<<<<<< HEAD
    input: 'src/index.js',
=======
    input: 'src/index.ts',
>>>>>>> parent of ed9e93f (Revert "added ts")
    output: {
      file: 'dist/topic_modeler.js',
      format: 'iife',
      name: 'TopicModeler',
<<<<<<< HEAD
=======
      exports: 'named',
>>>>>>> parent of ed9e93f (Revert "added ts")
      globals: {
        'a-trie-grows-in-js': 'js-trie',
        'arrset/dist/flexible': 'arrset',
      },
<<<<<<< HEAD
    },
    plugins: [commonjs(), nodeResolve()],
=======
      sourcemap: true,
    },
    plugins: [
      typescript({ compilerOptions: { module: 'CommonJS' } }),
      commonjs({ extensions: ['.js', '.ts'] }),
      nodeResolve(),
    ],
>>>>>>> parent of ed9e93f (Revert "added ts")
  },
];
