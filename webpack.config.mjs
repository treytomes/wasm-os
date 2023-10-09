import * as path from 'path'
import * as url from 'url'
import * as express from 'express'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin' // Required to make Jimp work in a browser.
import CopyPlugin from 'copy-webpack-plugin'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default {
  entry: {
    index: './src/index.ts'
  },
  mode: 'development',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
    //clean: true
  },
  devtool: 'inline-source-map',
  devServer: {
    static: true,
    port: 4000,

    devMiddleware: {
      publicPath: '/dist'
    },

    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      devServer.app.use('/', express.static(path.resolve(__dirname, 'dist')))

      devServer.app.get('/setup-middleware/some/path', (_, response) => {
        response.send('setup-middlewares option GET')
      })

      // Use the `unshift` method if you want to run a middleware before all other middlewares
      // or when you are migrating from the `onBeforeSetupMiddleware` option
      middlewares.unshift({
        name: 'first-in-array',
        // `path` is optional
        path: '/foo/path',
        middleware: (req, res) => {
          res.send('Foo!')
        }
      })

      // Use the `push` method if you want to run a middleware after all other middlewares
      // or when you are migrating from the `onAfterSetupMiddleware` option
      middlewares.push({
        name: 'hello-world-test-one',
        // `path` is optional
        path: '/foo/bar',
        middleware: (req, res) => {
          res.send('Foo Bar!')
        }
      })

      /*
			middlewares.push((req, res) => {
				res.send('Hello World!');
			});
			*/

      return middlewares
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }]
    }),
    new HtmlWebpackPlugin({
      title: 'wasm-os'
    }),
    new NodePolyfillPlugin() // Required to make Jimp work in a browser.
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader']
      },
      {
        test: /\.xml$/i,
        use: ['xml-loader']
      },
      {
        test: /\.(txt|fs|vs)$/i,
        use: ['text-loader']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/'
      },
      {
        test: /\.wasm?$/,
        type: 'javascript/auto', // Treat WASM files as an insert.
        use: {
          loader: 'wasm-loader',
          options: {
            // If you have custom options for wasm-loader, add them here.
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      fs: false // Required to make Jimp work in a browser.
    }
  }
}
