/**
 * Tests for BlockPy dialog system
 */

import { BlockPyDialog, DIALOG_HTML } from '../src/dialog.js';

describe('BlockPy Dialog', () => {
    describe('DIALOG_HTML', () => {
        test('should contain modal dialog markup', () => {
            expect(DIALOG_HTML).toContain('blockpy-dialog');
            expect(DIALOG_HTML).toContain('modal');
            expect(DIALOG_HTML).toContain('modal-dialog');
            expect(DIALOG_HTML).toContain('modal-content');
        });

        test('should have proper accessibility attributes', () => {
            expect(DIALOG_HTML).toContain('role="dialog"');
            expect(DIALOG_HTML).toContain("aria-label='Dialog'");
            expect(DIALOG_HTML).toContain('aria-modal="true"');
            expect(DIALOG_HTML).toContain('role="document"');
        });

        test('should have close and okay buttons', () => {
            expect(DIALOG_HTML).toContain('modal-close');
            expect(DIALOG_HTML).toContain('modal-okay');
            expect(DIALOG_HTML).toContain('Close');
            expect(DIALOG_HTML).toContain('Okay');
        });
    });

    describe('BlockPyDialog Class', () => {
        let mockMain, mockTag, mockElements;

        beforeEach(() => {
            // Create mock elements
            mockElements = {
                title: { text: jest.fn(), html: jest.fn() },
                body: { text: jest.fn(), html: jest.fn() },
                footer: { text: jest.fn(), html: jest.fn() },
                okay: { text: jest.fn(), click: jest.fn(), show: jest.fn(), hide: jest.fn() },
                close: { text: jest.fn(), click: jest.fn(), show: jest.fn(), hide: jest.fn() }
            };

            // Mock jQuery-like tag object
            mockTag = {
                find: jest.fn((selector) => {
                    switch (selector) {
                        case '.modal-title': return mockElements.title;
                        case '.modal-body': return mockElements.body;
                        case '.modal-footer': return mockElements.footer;
                        case '.modal-okay': return mockElements.okay;
                        case '.modal-close': return mockElements.close;
                        default: return { text: jest.fn(), html: jest.fn() };
                    }
                }),
                modal: jest.fn()
            };

            mockMain = {
                model: {
                    // Add any required model properties
                }
            };
        });

        test('should initialize with main and tag', () => {
            const dialog = new BlockPyDialog(mockMain, mockTag);
            
            expect(dialog.main).toBe(mockMain);
            expect(dialog.tag).toBe(mockTag);
        });

        test('should find dialog elements in DOM', () => {
            new BlockPyDialog(mockMain, mockTag);
            
            expect(mockTag.find).toHaveBeenCalledWith('.modal-title');
            expect(mockTag.find).toHaveBeenCalledWith('.modal-body');
            expect(mockTag.find).toHaveBeenCalledWith('.modal-footer');
            expect(mockTag.find).toHaveBeenCalledWith('.modal-okay');
            expect(mockTag.find).toHaveBeenCalledWith('.modal-close');
        });

        test('should initialize callback functions', () => {
            const dialog = new BlockPyDialog(mockMain, mockTag);
            
            expect(typeof dialog.yes).toBe('function');
            expect(typeof dialog.no).toBe('function');
        });

        test('should store element references', () => {
            const dialog = new BlockPyDialog(mockMain, mockTag);
            
            expect(dialog.titleTag).toBe(mockElements.title);
            expect(dialog.bodyTag).toBe(mockElements.body);
            expect(dialog.footerTag).toBe(mockElements.footer);
            expect(dialog.okayButton).toBe(mockElements.okay);
            expect(dialog.closeButton).toBe(mockElements.close);
        });

        test('should have default empty callback functions', () => {
            const dialog = new BlockPyDialog(mockMain, mockTag);
            
            // Should not throw when called
            expect(() => dialog.yes()).not.toThrow();
            expect(() => dialog.no()).not.toThrow();
        });
    });
});