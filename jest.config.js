const { name } = require('./package.json');

module.exports = {
    displayName: name,
    roots: ['.'],
    testMatch: [
        "**/+(*.)+(e2e).+(js)"
    ],
    coveragePathIgnorePatterns: ['index.ts', 'node_modules', 'jest.config.js'],
    rootDir: '.',
    transform: {
        '^.+\\.(t|j)s$': ['@swc/jest'],
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
};