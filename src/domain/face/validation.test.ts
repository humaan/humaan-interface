import { describe, expect, it } from "vitest";
import { DEFAULT_FACE } from "./model";
import { parseFaceState } from "./validation";

describe("parseFaceState", () => {
	it("returns a clean face state for valid input", () => {
		expect(parseFaceState({ ...DEFAULT_FACE, ignored: true })).toEqual(DEFAULT_FACE);
	});

	it("rejects invalid colours and unknown parts", () => {
		expect(() => parseFaceState({ ...DEFAULT_FACE, background: "#000000" })).toThrow(
			"Invalid face colours",
		);
		expect(() =>
			parseFaceState({
				...DEFAULT_FACE,
				parts: {
					...DEFAULT_FACE.parts,
					eye1: { ...DEFAULT_FACE.parts.eye1, name: "Nose01" },
				},
			}),
		).toThrow("Invalid eye1 part");
	});

	it("rejects positions that are off-grid or outside the face canvas", () => {
		expect(() =>
			parseFaceState({
				...DEFAULT_FACE,
				parts: {
					...DEFAULT_FACE.parts,
					eye1: { ...DEFAULT_FACE.parts.eye1, x: 1.25 },
				},
			}),
		).toThrow("Invalid eye1 position");
		expect(() =>
			parseFaceState({
				...DEFAULT_FACE,
				parts: {
					...DEFAULT_FACE.parts,
					eye1: { ...DEFAULT_FACE.parts.eye1, x: 10 },
				},
			}),
		).toThrow("outside the face canvas");
	});
});
