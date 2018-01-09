const env = process.env.BABEL_ENV || process.env.NODE_ENV || 'development';

var pluginList = [
  env === 'development' ? ['emotion', {sourceMap: true, autoLabel: true}] : 'emotion',
  'transform-decorators-legacy',
  'transform-class-properties',
  'transform-object-rest-spread',
  'transform-runtime',
  'lodash',
  'dynamic-import-node',
  'syntax-dynamic-import',
  'react-hot-loader/babel',
  [
    'babel-plugin-transform-builtin-extend',
    {
      globals: ['Array', 'Error'],
    },
  ],
];
if (env !== 'test') {
  pluginList.push('idx');
}

module.exports = {
  presets: [
    'react',
    [
      'latest',
      {
        es2015: {
          modules: env === 'test' ? 'commonjs' : false,
        },
      },
    ],
  ],
  plugins: pluginList,
};
