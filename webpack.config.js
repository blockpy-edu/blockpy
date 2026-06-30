const webpack = require("webpack");
const path = require("path");
const env = require("yargs").argv.env;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const libraryName = "blockpy";
let outputFile, mode;

if (env === "build") {
    mode = "production";
    outputFile = libraryName + ".min.js";
} else {
    mode = "development";
    outputFile = libraryName + ".js";
}

let config = {
    mode: mode,
    entry: {
        blockpy: __dirname + "/src/blockpy.ts"
    },
    devtool: "inline-source-map",
    output: {
        path: __dirname + "/dist",
        filename: outputFile,
        library: libraryName,
        libraryTarget: "umd",
        umdNamedDefine: true,
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "babel-loader"
                    },
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true
                        }
                    }
                ],
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // you can specify a publicPath here
                            // by default it uses publicPath in webpackOptions.output
                            publicPath: "../",
                            hmr: mode === "development",
                        },
                    },
                    "css-loader",
                ],
            }
        ]
    },
    resolve: {
        modules: [path.resolve("./node_modules"), path.resolve("./src")],
        extensions: [".ts", ".tsx", ".json", ".js"]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: "[name].css",
            chunkFilename: "[id].css",
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            ko: "knockout",
            FilePond: "filepond"
        })
    ],
    externals: {
        jquery: "jQuery",
        knockout: "ko",
        filepond: "FilePond"
    }
};

module.exports = config;