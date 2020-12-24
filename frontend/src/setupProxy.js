// const proxy = require('http-proxy-middleware');

// module.exports = function (app) {
//     app.use(proxy('/auth/facebook', { target: 'http://localhost:5000/' }));
// };

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/auth/facebook',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
        })
    );
};