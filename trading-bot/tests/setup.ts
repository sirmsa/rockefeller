// Jest setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('Cleaning up test environment...');
});
