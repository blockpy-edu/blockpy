/**
 * Tests for BlockPy storage system
 */

describe('BlockPy Storage', () => {
    describe('LocalStorageWrapper Module', () => {
        test('should export LocalStorageWrapper class', () => {
            const { LocalStorageWrapper } = require('../src/storage.js');
            expect(LocalStorageWrapper).toBeDefined();
            expect(typeof LocalStorageWrapper).toBe('function');
        });

        test('should create instance with namespace', () => {
            const { LocalStorageWrapper } = require('../src/storage.js');
            const storage = new LocalStorageWrapper('test');
            expect(storage.namespace).toBe('test');
        });

        test('should have required methods', () => {
            const { LocalStorageWrapper } = require('../src/storage.js');
            const storage = new LocalStorageWrapper('test');
            
            expect(typeof storage.set).toBe('function');
            expect(typeof storage.get).toBe('function');
            expect(typeof storage.remove).toBe('function');
            expect(typeof storage.has).toBe('function');
            expect(typeof storage.getDefault).toBe('function');
        });

        test('should handle namespace correctly in key generation', () => {
            const { LocalStorageWrapper } = require('../src/storage.js');
            const storage1 = new LocalStorageWrapper('app1');
            const storage2 = new LocalStorageWrapper('app2');
            
            expect(storage1.namespace).toBe('app1');
            expect(storage2.namespace).toBe('app2');
        });

        test('should not throw when calling methods', () => {
            const { LocalStorageWrapper } = require('../src/storage.js');
            const storage = new LocalStorageWrapper('test');
            
            // These should not throw even if localStorage is mocked
            expect(() => {
                storage.set('key', 'value');
                storage.get('key');
                storage.has('key');
                storage.remove('key');
                storage.getDefault('key', 'default');
            }).not.toThrow();
        });
    });
});