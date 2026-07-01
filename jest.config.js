module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+\\.js$": "babel-jest"
    },
    setupFiles: ["./tests/jest.setup.js"]
};
