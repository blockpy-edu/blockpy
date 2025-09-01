/**
 * Tests for BlockPy editors system
 */

import { EditorsEnum } from '../src/editors.js';

describe('BlockPy Editors', () => {
    describe('EditorsEnum', () => {
        test('should have all required editor types', () => {
            expect(EditorsEnum.SUBMISSION).toBe('submission');
            expect(EditorsEnum.ASSIGNMENT).toBe('assignment');
            expect(EditorsEnum.INSTRUCTIONS).toBe('instructions');
            expect(EditorsEnum.ON_RUN).toBe('on_run');
            expect(EditorsEnum.ON_CHANGE).toBe('on_change');
            expect(EditorsEnum.ON_EVAL).toBe('on_eval');
            expect(EditorsEnum.STARTING_CODE).toBe('starting_code');
            expect(EditorsEnum.SAMPLE_SUBMISSIONS).toBe('sample_submissions');
            expect(EditorsEnum.INSTRUCTOR_FILE).toBe('instructor_file');
        });

        test('should have string values for all enum entries', () => {
            Object.values(EditorsEnum).forEach(value => {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            });
        });

        test('should have unique values for all enum entries', () => {
            const values = Object.values(EditorsEnum);
            const uniqueValues = [...new Set(values)];
            expect(values.length).toBe(uniqueValues.length);
        });
    });
});