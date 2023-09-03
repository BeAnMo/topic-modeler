const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

module.exports = [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/topic_modeler.js',
            format: 'iife',
            name: 'TopicModeler',
            globals: {
                'a-trie-grows-in-js': 'js-trie',
                'arrset/dist/flexible': 'arrset'
            },
        },
        plugins: [commonjs(), nodeResolve()],
    },
];
