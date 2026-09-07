import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const sourceDirectory = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			{
				find: "@payload-config",
				replacement: `${sourceDirectory}/app/(payload)/_config/payload.config.ts`,
			},
			{
				find: /^@cms\/(.*)$/,
				replacement: `${sourceDirectory}/app/(payload)/_config/$1`,
			},
			{
				find: /^@\//,
				replacement: `${sourceDirectory}/`,
			},
		],
	},
});
