// 这个文件相当于vue2中的vue.config.js

const path = require("path")

module.exports = {
	// 配置目录别名
	alias: {
		// 键必须以斜线开始和结束
		"/@/": path.resolve(__dirname, "./src"),
	},
}
