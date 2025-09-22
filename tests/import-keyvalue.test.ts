import { describe, expect, test } from "vitest";

import { parseKeyValueLines, serializeKeyValueLines } from "@/lib/admin/utils";

describe("parseKeyValueLines", () => {
    test("parses lines with pipes into key/value", () => {
        const input = "metric|value\nmetric 2|value 2";
        expect(parseKeyValueLines(input)).toEqual([
            { key: "metric", value: "value" },
            { key: "metric 2", value: "value 2" },
        ]);
    });

    test("filters blank and malformed lines", () => {
        const input = "\n   \nnope|\n|bad\nok|good";
        expect(parseKeyValueLines(input)).toEqual([{ key: "ok", value: "good" }]);
    });
});

describe("serializeKeyValueLines", () => {
    test("joins records with newline and pipe", () => {
        const records = [
            { key: "metric", value: "value" },
            { key: "metric 2", value: "value 2" },
        ];
        expect(serializeKeyValueLines(records)).toBe("metric|value\nmetric 2|value 2");
    });

    test("empty returns empty string", () => {
        expect(serializeKeyValueLines([])).toBe("");
        expect(serializeKeyValueLines(null)).toBe("");

    });
});
