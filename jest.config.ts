import type {Config} from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/_setup/jest.setup.ts'],
  globalSetup: '<rootDir>/tests/_setup/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/_setup/globalTeardown.ts',
  testMatch: ['**/?(*.)+(test).(ts|tsx)'],
  collectCoverageFrom: ['<rootDir>/**/*.{ts,tsx}', '!<rootDir>/**/node_modules/**'],
};

export default config;
