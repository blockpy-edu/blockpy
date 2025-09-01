/**
 * Tests for BlockPy interface components
 */

import { SecondRowSecondPanelOptions, makeExtraInterfaceSubscriptions } from '../src/interface.js';

describe('BlockPy Interface', () => {
    describe('SecondRowSecondPanelOptions', () => {
        test('should have correct panel option values', () => {
            expect(SecondRowSecondPanelOptions.FEEDBACK).toBe('feedback');
            expect(SecondRowSecondPanelOptions.TRACE).toBe('trace');
            expect(SecondRowSecondPanelOptions.NONE).toBe('none');
        });
    });

    describe('makeExtraInterfaceSubscriptions', () => {
        let mockModel, mockSelf;

        beforeEach(() => {
            // Mock the model structure that makeExtraInterfaceSubscriptions expects
            mockModel = {
                ui: {
                    instructions: {
                        current: {
                            subscribe: jest.fn()
                        }
                    }
                },
                display: {
                    fullscreen: {
                        subscribe: jest.fn()
                    }
                },
                configuration: {
                    container: {
                        find: jest.fn().mockReturnValue({
                            map: jest.fn()
                        })
                    }
                }
            };
            mockSelf = {};
        });

        test('should setup instruction highlighting subscription', () => {
            makeExtraInterfaceSubscriptions(mockSelf, mockModel);
            expect(mockModel.ui.instructions.current.subscribe).toHaveBeenCalledWith(expect.any(Function));
        });

        test('should setup fullscreen subscription', () => {
            makeExtraInterfaceSubscriptions(mockSelf, mockModel);
            expect(mockModel.display.fullscreen.subscribe).toHaveBeenCalledWith(expect.any(Function));
        });

        test('should handle instruction highlighting callback', () => {
            jest.useFakeTimers();
            makeExtraInterfaceSubscriptions(mockSelf, mockModel);
            
            // Get the callback function that was passed to subscribe
            const callback = mockModel.ui.instructions.current.subscribe.mock.calls[0][0];
            
            // Call the callback to trigger highlighting
            callback();
            
            // Fast-forward time to trigger the timeout
            jest.advanceTimersByTime(400);
            
            expect(mockModel.configuration.container.find).toHaveBeenCalledWith('.blockpy-instructions pre code');
            
            jest.useRealTimers();
        });
    });
});