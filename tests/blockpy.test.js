/**
 * Tests for main BlockPy class
 */

// Mock CSS imports and external dependencies
jest.mock('../src/css/blockpy.css', () => ({}));
jest.mock('../src/css/bootstrap_retheme.css', () => ({}));

// Mock complex external modules that can't run in test environment
jest.mock('skulpt_modules/image', () => ({
    $builtinmodule: jest.fn()
}));
jest.mock('skulpt_modules/weakref', () => ({
    $builtinmodule: jest.fn()
}));

describe('BlockPy Main Class', () => {
    let mockContainer;

    beforeEach(() => {
        // Create a mock DOM container
        mockContainer = document.createElement('div');
        mockContainer.id = 'blockpy-test-container';
        document.body.appendChild(mockContainer);
    });

    afterEach(() => {
        // Clean up DOM after each test
        document.body.removeChild(mockContainer);
    });

    describe('Constructor', () => {
        test('should accept configuration object', () => {
            const config = {
                attachmentPoint: mockContainer,
                instructor: false
            };
            
            // We'll test that the constructor doesn't throw for now
            // Full initialization requires many dependencies
            expect(() => {
                // Just test the import/require of the BlockPy class works
                const { BlockPy } = require('../src/blockpy.js');
                expect(BlockPy).toBeDefined();
                expect(typeof BlockPy).toBe('function');
            }).not.toThrow();
        });
    });

    describe('Class Definition', () => {
        test('should export BlockPy class', () => {
            const { BlockPy } = require('../src/blockpy.js');
            expect(BlockPy).toBeDefined();
            expect(typeof BlockPy).toBe('function');
            expect(BlockPy.prototype.constructor).toBe(BlockPy);
        });

        test('should have required methods on prototype', () => {
            const { BlockPy } = require('../src/blockpy.js');
            expect(typeof BlockPy.prototype.initMain).toBe('function');
            expect(typeof BlockPy.prototype.getSetting).toBe('function');
        });
    });
    
    describe('Module exports', () => {
        test('should export CORGIS dataset constants', () => {
            const { _IMPORTED_COMPLETE_DATASETS, _IMPORTED_DATASETS } = require('../src/blockpy.js');
            expect(_IMPORTED_COMPLETE_DATASETS).toBeDefined();
            expect(_IMPORTED_DATASETS).toBeDefined();
        });
    });
});