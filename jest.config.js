module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+\\.[jt]s$": "babel-jest"
    },
    moduleFileExtensions: ["ts", "js", "json"],
    setupFiles: ["./tests/jest.setup.js"]
};
