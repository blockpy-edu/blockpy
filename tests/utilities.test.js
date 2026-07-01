import {
    arrayMove,
    indent,
    slug,
    capitalize,
    encodeHTML,
    extractPart,
    firstDefinedValue,
} from "../src/utilities";

// ─── arrayMove ───────────────────────────────────────────────────────────────

describe("arrayMove", () => {
    test("moves an element forward", () => {
        expect(arrayMove([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
    });

    test("moves an element backward", () => {
        expect(arrayMove([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3]);
    });

    test("returns the same array when old and new index are equal", () => {
        const arr = [1, 2, 3];
        expect(arrayMove(arr, 1, 1)).toBe(arr);
    });

    test("returns the same array when oldIndex is out of bounds", () => {
        const arr = [1, 2, 3];
        expect(arrayMove(arr, 5, 1)).toBe(arr);
    });

    test("returns the same array when newIndex is out of bounds", () => {
        const arr = [1, 2, 3];
        expect(arrayMove(arr, 0, 5)).toBe(arr);
    });

    test("moves element to start", () => {
        expect(arrayMove([1, 2, 3], 2, 0)).toEqual([3, 1, 2]);
    });

    test("moves element to end", () => {
        expect(arrayMove([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    });
});

// ─── indent ──────────────────────────────────────────────────────────────────

describe("indent", () => {
    test("indents a single-line string by four spaces", () => {
        expect(indent("hello")).toBe("    hello");
    });

    test("indents every line of a multi-line string", () => {
        expect(indent("line1\nline2\nline3")).toBe("    line1\n    line2\n    line3");
    });

    test("does not indent an empty string", () => {
        expect(indent("")).toBe("");
    });

    test("preserves existing indentation while adding four spaces", () => {
        expect(indent("  indented")).toBe("      indented");
    });
});

// ─── slug ────────────────────────────────────────────────────────────────────

describe("slug", () => {
    test("converts spaces to underscores", () => {
        expect(slug("hello world")).toBe("hello_world");
    });

    test("lowercases the result", () => {
        expect(slug("Hello World")).toBe("hello_world");
    });

    test("handles a string with no spaces", () => {
        expect(slug("hello")).toBe("hello");
    });

    test("handles multiple consecutive spaces", () => {
        expect(slug("a  b")).toBe("a__b");
    });

    test("handles an empty string", () => {
        expect(slug("")).toBe("");
    });
});

// ─── capitalize ──────────────────────────────────────────────────────────────

describe("capitalize", () => {
    test("capitalizes the first letter", () => {
        expect(capitalize("hello")).toBe("Hello");
    });

    test("leaves already-capitalized strings unchanged", () => {
        expect(capitalize("Hello")).toBe("Hello");
    });

    test("capitalizes only the first letter of a multi-word string", () => {
        expect(capitalize("hello world")).toBe("Hello world");
    });

    test("returns an empty string for a non-string argument", () => {
        expect(capitalize(42)).toBe("");
        expect(capitalize(null)).toBe("");
    });

    test("handles an empty string", () => {
        expect(capitalize("")).toBe("");
    });
});

// ─── encodeHTML ──────────────────────────────────────────────────────────────

describe("encodeHTML", () => {
    test("encodes ampersands", () => {
        expect(encodeHTML("a & b")).toBe("a &amp; b");
    });

    test("encodes less-than signs", () => {
        expect(encodeHTML("<tag>")).toBe("&lt;tag&gt;");
    });

    test("encodes greater-than signs", () => {
        expect(encodeHTML("1 > 0")).toBe("1 &gt; 0");
    });

    test("encodes double quotes", () => {
        expect(encodeHTML("say \"hello\"")).toBe("say &quot;hello&quot;");
    });

    test("encodes single quotes", () => {
        expect(encodeHTML("it's")).toBe("it&apos;s");
    });

    test("handles a string with no special characters", () => {
        expect(encodeHTML("hello world")).toBe("hello world");
    });

    test("handles an empty string", () => {
        expect(encodeHTML("")).toBe("");
    });

    test("encodes multiple special characters together", () => {
        expect(encodeHTML("<b>\"bold\" & 'italic'</b>")).toBe(
            "&lt;b&gt;&quot;bold&quot; &amp; &apos;italic&apos;&lt;/b&gt;"
        );
    });
});

// ─── extractPart ─────────────────────────────────────────────────────────────

describe("extractPart", () => {
    const multiPart = "##### Part A\nfirst body\n##### Part B\nsecond body";

    test("returns original text when partId is empty string", () => {
        expect(extractPart("some text", "")).toBe("some text");
    });

    test("returns original text when partId is null", () => {
        expect(extractPart("some text", null)).toBe("some text");
    });

    test("extracts the body of a named part", () => {
        expect(extractPart(multiPart, "A")).toBe("first body");
    });

    test("extracts the body of the last part", () => {
        expect(extractPart(multiPart, "B")).toBe("second body");
    });

    test("returns null when the part is not found", () => {
        expect(extractPart(multiPart, "C")).toBeNull();
    });

    test("handles text with a single part", () => {
        expect(extractPart("##### Part Only\nbody text", "Only")).toBe("body text");
    });
});

// ─── firstDefinedValue ───────────────────────────────────────────────────────

describe("firstDefinedValue", () => {
    test("returns the first non-null argument", () => {
        expect(firstDefinedValue(null, undefined, 42)).toBe(42);
    });

    test("returns the first argument when it is defined", () => {
        expect(firstDefinedValue(1, 2, 3)).toBe(1);
    });

    test("returns undefined when all arguments are null/undefined", () => {
        expect(firstDefinedValue(null, undefined)).toBeUndefined();
    });

    test("treats false and zero as defined values", () => {
        expect(firstDefinedValue(null, false)).toBe(false);
        expect(firstDefinedValue(null, 0)).toBe(0);
    });

    test("returns undefined when called with no arguments", () => {
        expect(firstDefinedValue()).toBeUndefined();
    });
});
