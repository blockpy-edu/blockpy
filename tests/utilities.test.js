/**
 * Tests for BlockPy utilities
 */

import { arrayMove } from '../src/utilities.js';

describe('BlockPy Utilities', () => {
    describe('arrayMove', () => {
        test('should move element to new position', () => {
            const arr = ['a', 'b', 'c', 'd'];
            const result = arrayMove(arr, 1, 3);
            expect(result).toEqual(['a', 'c', 'd', 'b']);
        });

        test('should handle same index', () => {
            const arr = ['a', 'b', 'c'];
            const result = arrayMove(arr, 1, 1);
            expect(result).toEqual(['a', 'b', 'c']);
        });

        test('should handle out of bounds index', () => {
            const arr = ['a', 'b', 'c'];
            const result = arrayMove(arr, 1, 10);
            expect(result).toEqual(['a', 'b', 'c']);
        });

        test('should move from end to beginning', () => {
            const arr = ['a', 'b', 'c', 'd'];
            const result = arrayMove(arr, 3, 0);
            expect(result).toEqual(['d', 'a', 'b', 'c']);
        });

        test('should not modify original array', () => {
            const arr = ['a', 'b', 'c'];
            const original = [...arr];
            arrayMove(arr, 0, 2);
            expect(arr).toEqual(original);
        });
    });
});