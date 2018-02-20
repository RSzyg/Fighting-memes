const path = require('path');

module.exports = {
  entry: './src/Entry.ts',
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
    filename: 'entry.js',
    path: path.resolve(__dirname, 'dist/')
  }
};
