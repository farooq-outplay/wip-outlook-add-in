/* eslint-disable no-undef */

const path = require("path");
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/";

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return {
    ca: httpsOptions.ca,
    key: httpsOptions.key,
    cert: httpsOptions.cert,
  };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";

  return {
    mode: dev ? "development" : "production",

    // Best source maps for Outlook + React debugging
    devtool: dev ? "eval-source-map" : "source-map", //  "eval-source-map"

    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      react: ["react", "react-dom"],

      taskpane: {
        import: "./src/taskpane/index.tsx",
        dependOn: "react",
      },

      dialog: {
        import: "./src/dialog/dialog.tsx",
        dependOn: "react",
      },

      commands: "./src/commands/commands.ts",
    },

    output: {
      clean: true,
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: dev ? urlDev : urlProd,
    },

    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
              sourceMaps: true,
            },
          },
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|ttf|woff|woff2|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]",
          },
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "react", "taskpane"],
      }),

      new HtmlWebpackPlugin({
        filename: "dialog.html",
        template: "./src/dialog/dialog.html",
        chunks: ["polyfill", "dialog", "react"],
      }),

      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"],
      }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets",
            to: "assets",
          },
          {
            from: "auth",
            to: "auth",
          },
          {
            from: "manifest*.xml",
            to: "[name][ext]",
            transform(content) {
              return dev ? content : content.toString().replace(new RegExp(urlDev, "g"), urlProd);
            },
          },
        ],
      }),

      new webpack.ProvidePlugin({
        Promise: ["es6-promise", "Promise"],
      }),
    ],

    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options:
          env.WEBPACK_BUILD || options.https !== undefined
            ? options.https
            : await getHttpsOptions(),
      },
      port: 3000,
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
    },
  };
};
