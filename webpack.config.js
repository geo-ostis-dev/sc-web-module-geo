const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env, argv) => {
    let mode = argv.mode || 'development';

    return {
        context: path.resolve(__dirname, 'src/js'),
        entry: 'index.js',
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'public')
        },

        module: {
            rules: [{
                test: /\.js$/,
                include: path.resolve(__dirname, 'src/js'),
                use: {
                    loader: 'babel-loader',
                    options: {presets: ['@babel/preset-env'], plugins: ['@babel/plugin-transform-runtime']}
                }
            }, {
                test: /\.less$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'less-loader', options: {
                        paths: [
                            path.resolve(__dirname, 'node_modules')
                        ]
                    }
                }]
            }, {
                test: /\.(png|jpg|svg|ttf)$/,
                loader: 'file-loader?name=[path][name].[ext]'
            }]
        },

        resolve: {
            modules: [
                path.resolve(__dirname, 'src/js'),
                'node_modules'],
            extensions: ['.js', '.less']
        },

        watchOptions: {aggregateTimeout: 100},
        devtool: mode === "development" ? "cheap-inline-module-source-map" : false,

        plugins: [
            new webpack.ProvidePlugin({
                _: 'lodash',
                $: 'jquery',
                L: 'leaflet',
                Mustache: 'mustache',
                turf: '@turf/turf'
            })
        ]
    }
};
