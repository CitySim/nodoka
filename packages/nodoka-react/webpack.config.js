const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

const convert = require('koa-connect');
const history = require('connect-history-api-fallback');
const proxy = require('http-proxy-middleware');

module.exports = {
	mode: "development",
	entry: {
		"nodoka": "./src/main.tsx"
	},
	devtool: "inline-source-map",
	serve: {
		add: (app, middleware, options) => {
			app.use(convert(proxy("/api", { target: "http://localhost:9000" })));
			app.use(convert(history()));
		},
	},
	plugins: [
		new Dotenv(),
	],
	module: {
		rules: [{
			test: /\.tsx?$/,
			use: "ts-loader",
			exclude: /node_modules/
		}]
	},
	resolve: {
		extensions: [ ".tsx", ".ts", ".js" ],
	},
	output: {
		path: path.resolve(__dirname, "dist"),
	}
};