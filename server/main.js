const express = require('express')
const debug = require('debug')('app:server')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')
const config = require('../config')

const app = express()
const paths = config.utils_paths

// const http = require('http');
// const httpProxy = require('http-proxy');
// const server = new http.Server(app);
const proxy = require('http-proxy-middleware');
const targetUrl = `http://${config.apiHost}:${config.apiPort}`;
app.use('/api', proxy({target: 'http://localhost:3001'}))
// const proxy = httpProxy.createProxyServer({
//   target: targetUrl,
//   ws: true,
// });

// app.use('/api', (req, res) => {
//   proxy.web(req, res, { target: `${targetUrl}/api` });
// });

// server.on('upgrade', (req, socket, head) => {
//   proxy.ws(req, socket, head);
// });

// proxy.on('error', (error, req, res) => {
//   if (error.code !== 'ECONNRESET') {
//     console.error('proxy error', error);
//   }
//   if (!res.headersSent) {
//     res.writeHead(500, { 'content-type': 'application/json' });
//   }
//   const json = { error: 'proxy_error', reason: error.message };
//   res.end(JSON.stringify(json));
// });

// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement universal
// rendering, you'll want to remove this middleware.
app.use(require('connect-history-api-fallback')())

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig)

  debug('Enable webpack dev and HMR middleware')
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath  : webpackConfig.output.publicPath,
    // contentBase : paths.client(),
    contentBase : 'http://localhost:3001',
    hot         : true,
    quiet       : config.compiler_quiet,
    noInfo      : config.compiler_quiet,
    lazy        : false,
    stats       : config.compiler_stats
  }))
  app.use(require('webpack-hot-middleware')(compiler))

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(paths.client('static')))
} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(paths.dist()))
}

module.exports = app
