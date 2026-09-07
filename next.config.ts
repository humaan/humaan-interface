import type { NextConfig } from "next";

const svgrOptions = {
	replaceAttrValues: {
		"#000": "currentColor",
		"#000000": "currentColor",
		black: "currentColor",
	},
	svgoConfig: {
		plugins: [
			{
				name: "preset-default",
				params: {
					overrides: {
						removeViewBox: false,
					},
				},
			},
		],
	},
};

const nextConfig: NextConfig = {
	allowedDevOrigins: ["127.0.0.1"],
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
				],
			},
		];
	},
	turbopack: {
		rules: {
			"*.svg": {
				loaders: [{ loader: "@svgr/webpack", options: svgrOptions }],
				as: "*.js",
			},
		},
	},
	webpack(config) {
		const fileLoaderRule = config.module.rules.find((rule: unknown) =>
			typeof rule === "object" && rule !== null && "test" in rule
				? rule.test instanceof RegExp && rule.test.test(".svg")
				: false,
		);

		if (typeof fileLoaderRule === "object" && fileLoaderRule && "exclude" in fileLoaderRule) {
			fileLoaderRule.exclude = /\.svg$/i;
		}

		config.module.rules.push({
			test: /\.svg$/i,
			exclude: /node_modules/,
			use: [{ loader: "@svgr/webpack", options: svgrOptions }],
		});

		return config;
	},
};

export default nextConfig;
