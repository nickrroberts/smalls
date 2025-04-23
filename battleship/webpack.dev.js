import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import HtmlWebpackPlugin from "html-webpack-plugin";

const config = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true,
    watchFiles: ['./src/**/*'],
    liveReload: true, 
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
      filename: "index.html",
    }),
  ],
});

export default config;