const config = {
	roots: ["src"],
	testEnvironment: "jsdom",
	collectCoverageFrom: ["src/**", "!**/mod.ts", "!src/main.ts"],
	transform: {
		"^.+\\.(t|j)sx?$": ["@swc/jest"],
	},
};

export default config;
