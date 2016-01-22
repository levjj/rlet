var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'eval',
  entry: ['mocha!./test/index.js'],
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.tests.js',
    publicPath: ''
  },
  plugins: [new ExtractTextPlugin('style.css', {allChunks: true})],
  resolve: {
    modulesDirectories: [
      'node_modules'
    ],
    extensions: ['', '.json', '.js'],
    alias: {
      expander: './expander.js'
    }
  },
  node: { fs: 'empty' },
  module: {
    preLoaders: [{
      test: /\.json$/,
      loader: 'json'
    }],
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel']},
      {test: /\.jsx$/, loader: 'babel'},
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css')},
      {test: /\.woff$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      {test: /\.woff2$/, loader: 'url?limit=10000&mimetype=application/font-woff2' },
      {test: /\.ttf$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      {test: /\.eot$/, loader: 'file' },
      {test: /\.svg$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};
