# BlockPy Testing Guide

This document describes the testing framework and how to run tests for the BlockPy interface.

## Overview

BlockPy now includes a comprehensive test suite that covers the main interface components and core functionality. The tests are built using Jest, a popular JavaScript testing framework.

## Test Categories

### Unit Tests
- **Utilities** (`tests/utilities.test.js`) - Tests for utility functions like `arrayMove`
- **Storage** (`tests/storage.test.js`) - Tests for localStorage wrapper functionality  
- **Interface** (`tests/interface.test.js`) - Tests for UI interface components and subscriptions
- **Editors** (`tests/editors.test.js`) - Tests for editor enums and configuration
- **Feedback** (`tests/feedback.test.js`) - Tests for feedback system HTML and class initialization
- **Dialog** (`tests/dialog.test.js`) - Tests for modal dialog system
- **BlockPy Main** (`tests/blockpy.test.js`) - Tests for main BlockPy class exports and structure

### Integration Tests
- **Integration** (`tests/integration.test.js`) - Tests for module loading, class initialization, and workflow validation

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (automatically re-run when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Running Specific Tests

```bash
# Run a specific test file
npm test -- tests/utilities.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="arrayMove"

# Run tests for a specific component
npm test -- --testPathPatterns=interface
```

## Test Structure

### Setup
- `tests/setup.js` - Global test setup file that mocks external dependencies like Skulpt, jQuery, and FilePond
- `jest.config.js` - Jest configuration including test patterns, coverage settings, and module mapping

### Mocking Strategy
Tests use comprehensive mocking for external dependencies:
- **Skulpt** - Mocked Python-to-JS compiler functions
- **jQuery/Knockout** - Mocked for DOM manipulation and data binding
- **FilePond** - Mocked file upload component
- **LocalStorage** - Mocked browser storage API
- **CSS imports** - Mapped to identity-obj-proxy to avoid import errors

### Test Patterns

Tests follow these patterns:
1. **Module Loading** - Verify modules can be imported without errors
2. **Class Instantiation** - Test that classes can be created with expected parameters
3. **Method Existence** - Verify required methods exist on class prototypes
4. **HTML Template Validation** - Check that HTML templates contain expected elements and accessibility attributes
5. **Functionality Testing** - Test specific behaviors like subscriptions, callbacks, and data flow

## Coverage

Current test coverage includes:
- Core utility functions (17.8% of utilities.js)
- Storage wrapper (71% of storage.js)  
- Interface components (31.8% of interface.js)
- Dialog system (40.3% of dialog.js)
- Basic class structure validation for all main components

## Adding New Tests

### Creating a New Test File

1. Create a file in the `tests/` directory with the pattern `*.test.js`
2. Import the module you want to test
3. Use `describe()` blocks to group related tests
4. Use `test()` or `it()` functions for individual test cases

Example:
```javascript
import { MyComponent } from '../src/my-component.js';

describe('MyComponent', () => {
    test('should initialize with default values', () => {
        const component = new MyComponent();
        expect(component.someProperty).toBe('expectedValue');
    });
});
```

### Best Practices

1. **Mock External Dependencies** - Use Jest mocks for any external libraries or browser APIs
2. **Test Public Interface** - Focus on testing the public API rather than internal implementation
3. **Use Descriptive Names** - Test names should clearly describe what is being tested
4. **Isolate Tests** - Each test should be independent and not rely on other tests
5. **Clean Up** - Use `beforeEach()` and `afterEach()` to set up and tear down test state

### Testing BlockPy Components

When testing BlockPy components, typically you'll need to:
1. Mock the main BlockPy instance structure
2. Mock jQuery-style DOM elements
3. Mock Knockout observables if testing data binding
4. Test that component initialization doesn't throw
5. Test that required DOM elements are found/created
6. Test that subscriptions and callbacks are set up correctly

Example:
```javascript
const mockMain = {
    model: {
        // Mock model structure
        execution: { feedback: { subscribe: jest.fn() } }
    }
};

const mockTag = {
    find: jest.fn(() => ({ text: jest.fn(), html: jest.fn() }))
};

const component = new MyBlockPyComponent(mockMain, mockTag);
expect(component.main).toBe(mockMain);
```

## Troubleshooting

### Common Issues

1. **Module Import Errors** - Ensure all external dependencies are mocked in `tests/setup.js`
2. **Reserved Word Errors** - Avoid using JavaScript reserved words as variable names
3. **Async Issues** - Use `async/await` or return promises for asynchronous tests
4. **Mock Issues** - Make sure mocks are set up before the modules are imported

### Debugging Tests

1. Use `console.log()` in tests to debug (but remove before committing)
2. Run single tests with `npm test -- --testNamePattern="test name"`
3. Use `--verbose` flag to see individual test results
4. Check Jest documentation for advanced debugging options

## Future Improvements

Potential areas for expanding test coverage:
1. More comprehensive editor testing
2. Engine and execution flow testing  
3. Server communication testing
4. File management system testing
5. End-to-end workflow testing
6. Performance testing
7. Accessibility testing
8. Cross-browser compatibility testing

## Dependencies

The testing framework uses these key dependencies:
- `jest` - Main testing framework
- `jest-environment-jsdom` - DOM environment for browser-like testing
- `babel-jest` - ES6+ transpilation for tests
- `identity-obj-proxy` - CSS import mocking
- `filepond` - File upload component (mocked in tests)

All test dependencies are installed as devDependencies and won't affect the production build.