const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefresh = require('react-refresh/babel')
const VERSION = require('../version.json').version

const {ENV, NODE_ENV} = process.env
const isLocal = ENV === 'local' && NODE_ENV !== 'production'

console.info(`Building for ${NODE_ENV}`)

// Setup plugins based on environment variable NODE_ENV:
const getPlugins = () => {
    const plugins = [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'IRIS Digital Pathology',
            filename: path.resolve(__dirname, 'build/index.html'),
            template: path.resolve(__dirname, 'src/index.ejs'),
            favicon: path.resolve(__dirname, 'images/Signature-Vertical-M.png'),
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV),
                ENV: JSON.stringify(ENV),
            },
        }),
    ]

    if (isLocal) {
        plugins.push(new ReactRefreshWebpackPlugin())
    }

    return plugins
}

module.exports = {
    entry: {
        vsb: ['./src/entrypoint.js'],
    },
    output: {
        filename: `[name]-${VERSION}-${ENV}.js`,
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
    },
    mode: NODE_ENV,
    devServer: {
        allowedHosts: 'all',
        port: 9094,
        hot: true,
        host: '0.0.0.0',
        server: {
            type: 'https',
        },
        historyApiFallback: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        static: path.resolve(__dirname, 'build'),
        proxy: {
            '/api': {
                target: `http://go:${process.env.GO_PORT}`,
                changeOrigin: true,
                secure: false,
                xfwd: true,
                pathRewrite: {'^/api' : ''},
            },
            '/saml': {
                target: `http://go:${process.env.GO_PORT}`,
                changeOrigin: true,
                secure: false,
                xfwd: true,
            },
            '/debug': {
                target: `http://go:${process.env.GO_PORT}`,
                changeOrigin: true,
                secure: false,
                xfwd: true,
            },
            '/connection/websocket': {
                target: `http://go:${process.env.GO_PORT}`,
                ws: true,
                xfwd: true,
            },
        },
    },
    optimization: {
        minimize: NODE_ENV === 'production',
        moduleIds: 'deterministic',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                },
            },
        },
    },
    devtool: 'source-map',
    module: {
        rules: [
            // {
            //     test: /\.less$/,
            //     use: [
            //         {
            //             loader: 'style-loader',
            //         },
            //         {
            //             loader: 'css-loader',
            //         },
            //         {
            //             loader: 'less-loader',
            //             options: {
            //                 lessOptions: {
            //                     modifyVars: {
            //                         'primary-color': '#005bb2',
            //                         'link-color': '#005bb2',
            //                         'border-radius-base': '2px',
            //                         'font-size-base': '13px',
            //                     },
            //                     javascriptEnabled: true,
            //                 },
            //             },
            //         },
            //     ],
            // },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(mp3|wav|mp4)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/resource',
            },
            {
                test: /\.m?jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        babelrc: true,
                        plugins: isLocal ? [ReactRefresh] : [],
                    },
                },
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },
    plugins: getPlugins(),
    resolve: {
        alias: {
            '@actions': path.resolve(__dirname, 'src/actions'),
            '@client': __dirname,
            '@components': path.resolve(__dirname, 'src/components'),
            '@containers': path.resolve(__dirname, 'src/containers'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@hoc': path.resolve(__dirname, 'src/hoc'),
            '@formatters': path.resolve(__dirname, 'src/organizers/formatters'),
            '@images': path.resolve(__dirname, 'images'),
            '@libs': path.resolve(__dirname, 'src/libs'),
            '@organizers': path.resolve(__dirname, 'src/organizers'),
            '@reducers': path.resolve(__dirname, 'src/reducers'),
            '@project': path.resolve(__dirname, '../'),
            '@socket': path.resolve(__dirname, 'src/actions/socket'),
            '@sounds': path.resolve(__dirname, 'sounds'),
            '@store': path.resolve(__dirname, 'src/store'),
            '@templates': path.resolve(__dirname, 'src/templates'),
            '@views': path.resolve(__dirname, 'src/views'),
        },
    },
}
