/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    globals: {
        "ts-jest": {
            diagnostics: {
                warnOnly: true,
            },
        },
    },
    setupFiles: ["<rootDir>/src/setup-jest.ts"],
    clearMocks: true,
}
