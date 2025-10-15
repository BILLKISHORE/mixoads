module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    'server.js',
    '!src/**/*.test.js'
  ],
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  verbose: true
};


