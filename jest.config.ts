import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    "^next-intl$": "<rootDir>/__mocks__/next-intl.js",
    "^next-intl/server$": "<rootDir>/__mocks__/next-intl-server.js",
    // `@/data/*` apunta a la carpeta `data/` de la raíz, no a `src/`.
    // Debe declararse antes que el alias genérico para tener prioridad.
    '^@/data/(.*)$': '<rootDir>/data/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    // nanoid 5 sólo publica ESM, que Jest no puede cargar sin transformar
    // node_modules. El sustituto replica su contrato (id aleatorio del alfabeto
    // url-safe) para no alterar lo que se está probando.
    '^nanoid$': '<rootDir>/__mocks__/nanoid.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/lib/types/**',
  ],
  coverageReporters: ['text-summary', 'lcov'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
