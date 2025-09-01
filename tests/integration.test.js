/**
 * Integration tests for BlockPy key user workflows
 */

describe('BlockPy Integration Tests', () => {
    describe('Module Loading', () => {
        test('should load all main modules without errors', () => {
            expect(() => {
                require('../src/utilities.js');
                require('../src/storage.js');
                require('../src/feedback.js');
                require('../src/dialog.js');
                require('../src/editors.js');
                require('../src/interface.js');
            }).not.toThrow();
        });

        test('should export expected classes and functions', () => {
            const utilities = require('../src/utilities.js');
            const storage = require('../src/storage.js');
            const feedback = require('../src/feedback.js');
            const dialog = require('../src/dialog.js');
            const editors = require('../src/editors.js');
            const interfaceModule = require('../src/interface.js');

            // Check utilities exports
            expect(utilities.arrayMove).toBeDefined();
            expect(typeof utilities.arrayMove).toBe('function');

            // Check storage exports
            expect(storage.LocalStorageWrapper).toBeDefined();
            expect(typeof storage.LocalStorageWrapper).toBe('function');

            // Check feedback exports
            expect(feedback.BlockPyFeedback).toBeDefined();
            expect(feedback.FEEDBACK_HTML).toBeDefined();
            expect(typeof feedback.BlockPyFeedback).toBe('function');

            // Check dialog exports
            expect(dialog.BlockPyDialog).toBeDefined();
            expect(dialog.DIALOG_HTML).toBeDefined();
            expect(typeof dialog.BlockPyDialog).toBe('function');

            // Check editors exports
            expect(editors.EditorsEnum).toBeDefined();
            expect(typeof editors.EditorsEnum).toBe('object');

            // Check interface exports
            expect(interfaceModule.SecondRowSecondPanelOptions).toBeDefined();
            expect(interfaceModule.makeExtraInterfaceSubscriptions).toBeDefined();
            expect(typeof interfaceModule.makeExtraInterfaceSubscriptions).toBe('function');
        });
    });

    describe('HTML Template Validation', () => {
        test('should have valid HTML structure in templates', () => {
            const feedback = require('../src/feedback.js');
            const dialog = require('../src/dialog.js');

            // Test that HTML templates are strings and contain expected elements
            expect(typeof feedback.FEEDBACK_HTML).toBe('string');
            expect(feedback.FEEDBACK_HTML.length).toBeGreaterThan(0);
            expect(feedback.FEEDBACK_HTML).toContain('<div');

            expect(typeof dialog.DIALOG_HTML).toBe('string');
            expect(dialog.DIALOG_HTML.length).toBeGreaterThan(0);
            expect(dialog.DIALOG_HTML).toContain('<div');
        });

        test('should have accessibility attributes in templates', () => {
            const feedback = require('../src/feedback.js');
            const dialog = require('../src/dialog.js');

            // Check for ARIA attributes
            expect(feedback.FEEDBACK_HTML).toContain('aria-label');
            expect(feedback.FEEDBACK_HTML).toContain('role=');

            expect(dialog.DIALOG_HTML).toContain('aria-label');
            expect(dialog.DIALOG_HTML).toContain('role=');
        });
    });

    describe('Class Initialization', () => {
        let mockContainer;

        beforeEach(() => {
            mockContainer = document.createElement('div');
            mockContainer.id = 'test-container';
            document.body.appendChild(mockContainer);
        });

        afterEach(() => {
            document.body.removeChild(mockContainer);
        });

        test('should initialize storage wrapper without errors', () => {
            const { LocalStorageWrapper } = require('../src/storage.js');
            
            expect(() => {
                const storage = new LocalStorageWrapper('blockpy-test');
                expect(storage.namespace).toBe('blockpy-test');
            }).not.toThrow();
        });

        test('should initialize dialog with mock DOM elements', () => {
            const { BlockPyDialog } = require('../src/dialog.js');
            
            const mockTag = {
                find: jest.fn(() => ({
                    text: jest.fn(),
                    html: jest.fn(),
                    click: jest.fn(),
                    show: jest.fn(),
                    hide: jest.fn()
                })),
                modal: jest.fn()
            };

            expect(() => {
                const dialog = new BlockPyDialog({}, mockTag);
                expect(typeof dialog.yes).toBe('function');
                expect(typeof dialog.no).toBe('function');
            }).not.toThrow();
        });

        test('should initialize feedback with mock DOM elements', () => {
            const { BlockPyFeedback } = require('../src/feedback.js');
            
            const mockTag = {
                find: jest.fn(() => ({
                    text: jest.fn(),
                    html: jest.fn()
                }))
            };

            const mockMain = {
                model: {
                    execution: {
                        feedback: {
                            subscribe: jest.fn()
                        }
                    },
                    submission: {
                        code: {
                            subscribe: jest.fn()
                        }
                    },
                    display: {
                        dirtySubmission: jest.fn()
                    }
                }
            };

            expect(() => {
                const feedback = new BlockPyFeedback(mockMain, mockTag);
                expect(feedback.main).toBe(mockMain);
                expect(feedback.tag).toBe(mockTag);
            }).not.toThrow();
        });
    });

    describe('Enum and Constants', () => {
        test('should have stable enum values', () => {
            const { EditorsEnum } = require('../src/editors.js');
            const { SecondRowSecondPanelOptions } = require('../src/interface.js');

            // These values should remain stable for API compatibility
            expect(EditorsEnum.SUBMISSION).toBe('submission');
            expect(EditorsEnum.ASSIGNMENT).toBe('assignment');
            
            expect(SecondRowSecondPanelOptions.FEEDBACK).toBe('feedback');
            expect(SecondRowSecondPanelOptions.TRACE).toBe('trace');
            expect(SecondRowSecondPanelOptions.NONE).toBe('none');
        });
    });
});