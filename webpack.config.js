const path = require("path");
const webpack = require("webpack");
const glob = require("glob");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const PurifycssWebpack = require("purifycss-webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

let cesiumSource = "./node_modules/cesium/Source";
let cesiumWorkers = "../Build/Cesium/Workers";

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "build.js",
    path: path.resolve("./build") //路径必须是绝对路径
  },
  resolve: {
    alias: {
      "@": path.resolve("src"),
      cesium: path.resolve(__dirname, cesiumSource)
    }
  },
  //配置webpack.config.js devServer
  devServer: {
    contentBase: "build", //定义内容位置
    port: 9090, //端口号
    compress: true, //启动服务器压缩文件,
    open: true, //自动打开默认浏览器
    hot: true //热更新
  },
  module: {
    unknownContextCritical: /^.\/.*$/,
    unknownContextCritical: false,
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(c|le)ss$/, // 可以打包后缀为sass/scss/css的文件
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
      },

      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        use: "url-loader"
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
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
    new CopyWebpackPlugin([
      {
        from: "./src/docs",
        to: "pubilc"
      }
    ]),
    new MiniCssExtractPlugin({
      // 这里的配置和webpackOptions.output中的配置相似
      // 即可以通过在名字前加路径，来决定打包后的文件存在的路径
      filename: devMode ? "css/[name].css" : "css/[name].[hash].css",
      chunkFilename: devMode ? "css/[id].css" : "css/[id].[hash].css"
    }),

    // cesium.js
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, cesiumWorkers),
        to: "Workers"
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, "Assets"),
        to: "Assets"
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, "Widgets"),
        to: "Widgets"
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, "ThirdParty/Workers"),
        to: "ThirdParty/Workers"
      }
    ]),
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify("./")
    })
  ]
};
