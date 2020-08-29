const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

module.exports = {
  entry: {
    entrance: ["./src/entrance.ts", "./styles/entrance.scss"],
    main: ["./src/main_entry.ts", "./styles/main.scss"]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
    new webpack.EnvironmentPlugin(["API_ORIGIN"])
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 8000
  }
};
