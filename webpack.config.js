const path = require('path')
const debug = process.env.NODE_ENV !== 'production'
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  context: __dirname,
  devtool: debug ? 'inline-sourcemap' : false,
  entry: {
    index: './src/js/index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015'],
            plugins: ['transform-object-rest-spread']
          }
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: debug ? [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader', options: {
              sourceMap: true
          }
        }, {
          loader: 'sass-loader', options: {
              sourceMap: true
          }
        }] :
        ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!sass-loader'
        }),
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  plugins: debug ?
    [
      new HtmlPlugin({
        filename: 'index.html',
        template: './index.html',
        inject: true
      })
    ] :
    [
      new ExtractTextPlugin('styles.css'),
      new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
      new HtmlPlugin({
        filename: 'index.html',
        template: './index.html',
        inject: true
      })
    ],
};
