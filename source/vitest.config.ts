import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "happy-dom",
			include: ["src/**/*.test.ts"],
			clearMocks: true,
			coverage: {
				provider: "v8",
				reporter: ["text", "text-summary"],
				include: ["src/**/*.ts"],
				exclude: [
					"src/**/*.test.ts",
					"src/main.ts",
					"src/**/*.vue",
					"src/vite-env.d.ts",
				],
			},
		},
	}),
);
