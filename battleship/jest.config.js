export default {
    testEnvironment: 'node',
    transform: {}, // required to silence transform warnings when using ESM without Babel
    testMatch: ['**/test/**/*.js'],
    moduleNameMapper: {
      "\\.(png|jpg|jpeg|svg)$": "<rootDir>/__mocks__/fileMock.js"
    }
  };