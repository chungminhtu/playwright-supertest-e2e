const { name } = require('./package.json');

module.exports = {
    displayName: name,
    roots: ['.'],
    testMatch: [
        "**/+(*.)+(test).+(js)"
    ],
    coveragePathIgnorePatterns: ['index.ts', 'node_modules', 'jest.config.js'],
    rootDir: '.',
    transform: {
        '^.+\\.(t|j)s$': ['@swc/jest'],
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
};