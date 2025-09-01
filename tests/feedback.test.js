/**
 * Tests for BlockPy feedback system
 */

import { BlockPyFeedback, FEEDBACK_HTML } from '../src/feedback.js';

describe('BlockPy Feedback', () => {
    describe('FEEDBACK_HTML', () => {
        test('should contain feedback markup', () => {
            expect(FEEDBACK_HTML).toContain('blockpy-feedback');
            expect(FEEDBACK_HTML).toContain('Feedback:');
            expect(FEEDBACK_HTML).toContain('Rate this Feedback:');
        });

        test('should have proper accessibility attributes', () => {
            expect(FEEDBACK_HTML).toContain('aria-label="Feedback"');
            expect(FEEDBACK_HTML).toContain('aria-live="polite"');
            expect(FEEDBACK_HTML).toContain('role="region"');
        });

        test('should include rating functionality', () => {
            expect(FEEDBACK_HTML).toContain('fa-thumbs-up');
            expect(FEEDBACK_HTML).toContain('fa-thumbs-down');
            expect(FEEDBACK_HTML).toContain('ui.feedback.rate');
        });
    });

    describe('BlockPyFeedback Class', () => {
        let mockMain, mockTag, mockModel;

        beforeEach(() => {
            // Create mock jQuery-like tag object
            mockTag = {
                find: jest.fn().mockReturnValue({
                    // Mock jQuery object methods
                    text: jest.fn(),
                    html: jest.fn(),
                    addClass: jest.fn(),
                    removeClass: jest.fn()
                })
            };

            // Create mock model structure
            mockModel = {
                execution: {
                    feedback: {
                        // Mock observable properties
                        subscribe: jest.fn(),
                        label: jest.fn(),
                        message: jest.fn(),
                        category: jest.fn()
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
            };

            mockMain = {
                model: mockModel
            };
        });

        test('should initialize with main and tag', () => {
            const feedback = new BlockPyFeedback(mockMain, mockTag);
            
            expect(feedback.main).toBe(mockMain);
            expect(feedback.tag).toBe(mockTag);
            expect(feedback.feedbackModel).toBe(mockModel.execution.feedback);
        });

        test('should find feedback elements in DOM', () => {
            new BlockPyFeedback(mockMain, mockTag);
            
            expect(mockTag.find).toHaveBeenCalledWith('.blockpy-feedback-category');
            expect(mockTag.find).toHaveBeenCalledWith('.blockpy-feedback-label');
            expect(mockTag.find).toHaveBeenCalledWith('.blockpy-feedback-message');
            expect(mockTag.find).toHaveBeenCalledWith('.blockpy-feedback-positive');
        });

        test('should subscribe to code changes', () => {
            new BlockPyFeedback(mockMain, mockTag);
            
            expect(mockModel.submission.code.subscribe).toHaveBeenCalledWith(expect.any(Function));
        });

        test('should mark submission as dirty when code changes', () => {
            new BlockPyFeedback(mockMain, mockTag);
            
            // Get the callback function passed to subscribe
            const callback = mockModel.submission.code.subscribe.mock.calls[0][0];
            
            // Call it to simulate code change
            callback();
            
            expect(mockModel.display.dirtySubmission).toHaveBeenCalledWith(true);
        });
    });
});