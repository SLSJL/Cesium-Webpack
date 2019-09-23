const path = require("path");
const glob = require("glob");

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const PurifycssWebpack = require("purifycss-webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// The path to the cesium source code
const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";

module.exports = [
  {
    mode: "production",
    context: __dirname,
    entry: {
      app: path.resolve(__dirname, "./src/main.js")
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      // Needed by Cesium for multiline strings
      sourcePrefix: ""
    },
    amd: {
      // Enable webpack-friendly use of require in cesium
      toUrlUndefined: true
    },
    node: {
      // Resolve node module use of fs
      fs: "empty"
    },
    resolve: {
      alias: {
        // Cesium module name
        cesium: path.resolve(__dirname, cesiumSource)
      }
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.less$/, // 可以打包后缀为sass/scss/css的文件
          use: ["style-loader", "css-loader", "less-loader"]
        },
        {
          test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
          type: "javascript/auto",
          use: ["url-loader"]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html", //指定模板
        title: "Cesuim", //指定title
        minify: {
          removeAttributeQuotes: true, //去除属性的双引号
          collapseWhitespace: true //折叠代码为一行
        }, //上线时优化代码使用
        hash: true //清除缓存
      }),
      //在html-webpack-plugin之后载入
      new PurifycssWebpack({
        paths: glob.sync(path.resolve("src/*.html"))
      }),
      new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: ["dist"]
      }), //该配置需要在new HtmlWebpackPlugin之前
      new webpack.HotModuleReplacementPlugin(),

      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6
        }
      }),
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, "./src/public"),
          to: "./pubilc"
        }
      ]),
      // Copy Cesium Assets, Widgets, and Workers to a static directory
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Assets"), to: "Assets" }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Widgets"), to: "Widgets" }
      ]),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify("")
      }),
      // Split cesium into a seperate bundle
      new webpack.optimize.RuntimeChunkPlugin({
        name: "cesium",
        minChunks: function(module) {
          return module.context && module.context.indexOf("cesium") !== -1;
        }
      })
    ],

    // development server options
    devServer: {
      port: 9090, //端口号
      compress: true, //启动服务器压缩文件,
      open: true, //自动打开默认浏览器
      hot: true, //热更新
      overlay: true
    }
  }
];
