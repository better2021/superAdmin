module.exports = {
	env: {
		browser: true,
		node: true,
		commonjs: true,
	},
	parserOptions: {
		sourceType: "module", // 设置为 "script" (默认) 或 "module"（ES6)。
		ecmaFeatures: {
			jsx: true, // 启用 JSX
		},
	},
	// vue是eslint-plugin-vue的简写，此插件的作用是可以让eslint识别.vue中的script代码
	plugins: ["html", "vue", "prettier", "import"],
	/**
	 *  add your custom rules here
	 * 0或者off表示规则关闭，出错也被忽略；1或者warn表示如果出错会给出警告(不会导致程序退出)；
	 * 2或者error表示如果出错会报出错误(会导致程序退出，退出码是1)
	 */
	rules: {
		// allow debugger during development
		"no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
		"prettier/prettier": "warn",
		// 使用 === 替代 ==
		eqeqeq: [2, "allow-null"],
		"no-eval": 0,
		semi: [2, "never"],
	},
}
