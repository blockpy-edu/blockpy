module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Transform ES6 modules and CSS imports
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    
    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Test file patterns
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/src/**/*.test.js'
    ],
    
    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/skulpt_modules/**',
        '!src/blockly_blocks/**'
    ],
    
    // Module resolution
    moduleDirectories: ['node_modules', 'src'],
    
    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
    
    // Mock CSS imports
    moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy'
    }
};