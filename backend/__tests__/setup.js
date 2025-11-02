// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/file-share-test';
process.env.PORT = 5001;
process.env.UPLOAD_LIMIT = '100MB';

// Mock console methods to keep test output clean
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  };
});

afterAll(() => {
  // Restore original console
  global.console = originalConsole;
});
