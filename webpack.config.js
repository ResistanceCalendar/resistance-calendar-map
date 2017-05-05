const path = require('path')
const debug = process.env.NODE_ENV !== 'production'
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')

module.exports = {
  context: __dirname,
  devtool: debug ? 'inline-sourcemap' : null,
  entry: './src/js/index.js',
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
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader", options: {
              sourceMap: true
          }
        }, {
          loader: "sass-loader", options: {
              sourceMap: true
          }
        }]
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'build/js'),
    filename: 'index.js'
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
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    ],
};
