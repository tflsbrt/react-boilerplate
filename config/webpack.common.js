const path = require("path");
const paths = require("./paths");

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

module.exports = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return {
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "eval-source-map" : "source-map",
    entry: [paths.src + "/index.tsx"],
    output: {
      path: paths.build,
      filename: "[name].[contenthash].js",
      publicPath: isDevelopment ? "http://localhost:5001/" : "/",
      globalObject: "this",
      chunkLoadingGlobal: `webpackJsonp_sspahtmlwithjs`,
    },
    optimization: {
      splitChunks: false,
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
    },
    devServer: {
      static: paths.public,
      hot: true,
      port: 5001,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      allowedHosts: "auto",
    },
    plugins: [
      isDevelopment && new ReactRefreshWebpackPlugin(),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: paths.public + "/index.html",
      }),
      new WebpackManifestPlugin({
        fileName: "asset-manifest.json",
        publicPath: "/",
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const chunks = ["main"];
          const entrypointFiles = entrypoints[chunks];
          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: paths.public + "/manifest.json", to: "manifest.json" },
          { from: paths.public + "/robots.txt", to: "robots.txt" },
          { from: paths.src + "/assets", to: "assets" },
        ],
      }),
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              plugins: [
                isDevelopment && require.resolve("react-refresh/babel"),
              ].filter(Boolean),
            },
          },
        },
        {
          test: /\.(scss|css)$/,
          exclude: /node_modules/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { sourceMap: true, importLoaders: 1 },
            },
            { loader: "sass-loader", options: { sourceMap: true } },
          ],
        },
        { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: "asset/resource" },
        { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: "asset/inline" },
      ],
    },
    externals: ["single-spa"],
  };
};
