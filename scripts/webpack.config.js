const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleStatsWebpackPlugin } = require('bundle-stats');

const path = require('path');

module.exports = {
    entry: {
        main: './src/index.tsx',
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".js", ".ts", ".tsx"]
    },
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'static/js/v4/[name].[chunkhash].js',
        publicPath: "/" // should be CND in production
    },
    optimization: {
        runtimeChunk: 'single', // extracts runtime boilerplate
        splitChunks: {
            // vendors long term cache strategy
            maxAsyncRequests: 50,
            maxInitialRequests: 20,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'initial',
                    priority: 0,
                },
            },
        },
    },
    recordsPath: path.resolve(__dirname, "./records.json"),
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new BundleStatsWebpackPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebPackPlugin({
            template: "./public/index.html",
            filename: "./index.html"
        }),
    ]
};
