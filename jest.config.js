module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|firebase)',
    ],
    testMatch: [
        '**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
        '**/?(*.)+(spec|test).(ts|tsx|js|jsx)',
    ],
    collectCoverageFrom: [
        '**/*.{ts,tsx,js,jsx}',
        '!**/coverage/**',
        '!**/node_modules/**',
        '!**/babel.config.js',
        '!**/expo-env.d.ts',
        '!**/*.config.js',
        '!**/.expo/**',
        '!**/.storybook/**',
        '!**/e2e/**',
    ],
    setupFilesAfterEnv: [
        './__tests__/setup.ts',
        '@testing-library/jest-native/extend-expect',
    ],
    setupFiles: [
        './__tests__/setup.asyncstorage.ts',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testEnvironment: 'node',
    testTimeout: 10000,
    verbose: true,
};