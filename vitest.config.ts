import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"~": path.resolve(__dirname),
		},
	},
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["html", "lcov", "text"],
			include: ["src/**/*.ts", ".cli/**/*.ts"],
			exclude: [
				"**/*.test.ts",
				"**/test/**",
				"**/const/**",
				"**/errors/**",
				"**/*.test.ts",
				"**/types/**",
				"**/entities/**",
				"**/*.d.ts",
				"**/__mocks__/**",
				"**/loadConfig.ts",
				".cli/config.ts",
				".cli/extracts.ts",
				".cli/generators.ts",
				".cli/starters.ts",
				"src/**/index.ts",
			],
		},
	},
});
