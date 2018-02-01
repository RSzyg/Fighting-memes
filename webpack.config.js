const path = require('path');

module.exports = {
  entry: './src/Main.ts',
  module: {
    rules: [
      {
	test: /\.tsx?$/,
	use: [
	  { loader: 'ts-loader' },
	  { loader: 'tslint-loader' }
	]
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
