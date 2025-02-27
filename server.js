const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// 启用CORS，允许来自任何来源的请求
app.use(cors());


// mexc api
// 将所有 /api 请求代理到目标API
app.use('/api/getAllSymbols', createProxyMiddleware({
    target: 'https://contract.mexc.com/api/v1/contract/ticker', // 目标API地址
    changeOrigin: true,
    pathRewrite: {
        '^/api/getAllSymbols': '', // 将 /api/getAllSymbols 去掉，只保留基础路径
    },
    onProxyRes: function (proxyRes, req, res) {
        // 手动添加CORS头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    },
}));

app.use('/api/getDayKLineData/:symbol', createProxyMiddleware({
    target: 'https://contract.mexc.com',
    changeOrigin: true,
    pathRewrite: (path, req) => {
        const { symbol } = req.params;
        const { timestamp, interval = 'Day1' } = req.query;  // 从查询字符串获取可选参数
        let queryString = `interval=${interval}`;
        
        if (timestamp) {
            queryString += `&start=${timestamp}`;
        }

        return `/api/v1/contract/kline/${symbol}?${queryString}`;
    },
    onProxyRes: function (proxyRes) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    },
}));

app.use('/api/getMinutesKLineData/:symbol', createProxyMiddleware({
    target: 'https://contract.mexc.com',
    changeOrigin: true,
    pathRewrite: (path, req) => {
        const { symbol } = req.params; // 获取路径参数中的 symbol
        const { timestamp, interval = 'Min1' } = req.query; // 从查询字符串获取 timestamp 和 interval

        // 构造新的查询字符串
        let queryString = `interval=${interval}`;
        if (timestamp) {
            queryString += `&start=${timestamp}`;
        }

        // 返回目标路径
        return `/api/v1/contract/kline/${symbol}?${queryString}`;
    },
    onProxyRes: function (proxyRes) {
        // 设置跨域相关的响应头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    },
}));



app.listen(process.env.PORT || 4000, '0.0.0.0', () => {
    console.log('Proxy server is running on http://localhost:4000');
});
