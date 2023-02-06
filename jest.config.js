/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "decky-frontend-lib": "decky-frontend-lib"
  },
  transformIgnorePatterns: [
    '/node_modules/(?!decky-frontend-lib/)'
  ]
};