import { describe, expect, it } from "vitest";
import { getLookupKeyAliases, normalizeLookupKey } from "./lookup-key";

describe("normalizeLookupKey", () => {
	it("trims and lowercases text without validating it as an email address", () => {
		expect(normalizeLookupKey("  SAM+Faces@Example.COM  ")).toBe("sam+faces@example.com");
		expect(normalizeLookupKey("not an email")).toBe("not an email");
	});

	it("canonicalizes Humaan addresses around .com.au", () => {
		expect(normalizeLookupKey("SAM@HUMAAN.COM")).toBe("sam@humaan.com.au");
		expect(normalizeLookupKey("sam@humaan.com.au")).toBe("sam@humaan.com.au");
		expect(getLookupKeyAliases("sam@humaan.com")).toEqual([
			"sam@humaan.com.au",
			"sam@humaan.com",
		]);
	});

	it("returns an empty key for non-text values", () => {
		expect(normalizeLookupKey(null)).toBe("");
	});
});
