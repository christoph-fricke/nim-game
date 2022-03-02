const config = {
  roots: ["src"],
  testEnvironment: "node",
  collectCoverageFrom: ["src/**", "!**/index.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
};

export default config;
