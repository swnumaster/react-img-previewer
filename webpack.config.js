const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, "demo/src/index.html"),
    filename: "./index.html"
});

/*
    Task example/src/index.js as the entry of the project handling the dependency relationship of resource files
    Use babel-loader to complie js and jsx files
    Use style-loader and css-loader to handle css dependencies and inject inline styles
    Use svg-url-loader to handle svg files
    Use html-webpack-plugin to inject complied and packed script files
    devServer is to set the host and port of the web server (host is not necessary)
 */
module.exports = {
    entry: path.join(__dirname, "demo/src/index.js"),
    output: {
        path: path.join(__dirname, "demo/dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.svg$/,
                use: ["svg-url-loader"]
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            publicPath: "./images", // html的img标签src所指向图片的位置，与outputPath一致
                            outputPath: "images",   // 打包图片放置的位置
                            esModule: false,
                        }
                    }
                ]
            },
        ]
    },
    plugins: [htmlWebpackPlugin],
    resolve: {
        extensions: [".js", ".jsx"]
    },
    devServer: {
        host: "0.0.0.0",
        port: 3001
    },
    mode: 'development'
};