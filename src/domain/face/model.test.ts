import { describe, expect, it } from "vitest";
import {
	centreFaceParts,
	createRandomFace,
	createSeededRandom,
	DEFAULT_FACE,
	DEFAULT_FACE_PART_LOCKS,
	FACE_COLORS,
	GRID_DIVISIONS,
	moveFacePart,
	randomiseFace,
	selectFacePart,
	setFaceColor,
} from "./model";
import { getPartDefinition } from "./parts";

describe("face model", () => {
	it("creates a complete, contrasting random face within the canvas", () => {
		const face = createRandomFace(() => 0);

		expect(FACE_COLORS).toContain(face.background);
		expect(FACE_COLORS).toContain(face.foreground);
		expect(face.background).not.toBe(face.foreground);
		expect(face.parts.mouth).not.toBeNull();
		expect(face.parts.nose).not.toBeNull();

		Object.values(face.parts).forEach(placement => {
			if (!placement) return;
			const definition = getPartDefinition(placement.name);

			expect(placement.x).toBeGreaterThanOrEqual(0);
			expect(placement.y).toBeGreaterThanOrEqual(0);
			expect(placement.x + definition.width).toBeLessThanOrEqual(GRID_DIVISIONS);
			expect(placement.y + definition.height).toBeLessThanOrEqual(GRID_DIVISIONS);
		});
	});

	it("supports faces where the mouth supplies the eye slots", () => {
		const face = createRandomFace(() => 0.3);

		expect(face.parts.nose).toBeNull();
		expect(face.parts.eye1).not.toBeNull();
		expect(face.parts.eye2).not.toBeNull();
	});

	it("supports a combined nose and eye with only one separate eye", () => {
		const face = createRandomFace(() => 0.99);

		expect(face.parts.nose?.name).toBe("NoseEye06");
		expect(face.parts.eye1).not.toBeNull();
		expect(face.parts.eye2).toBeNull();
	});

	it("keeps a replacement part centred on the previous part", () => {
		const face = createRandomFace(() => 0);
		const replaced = selectFacePart(face, "nose", "Nose07");

		expect(replaced.parts.nose).toMatchObject({ name: "Nose07", x: 3.5, y: 2 });
	});

	it("snaps movement to half-grid positions and clamps it to the canvas", () => {
		const face = selectFacePart(
			createRandomFace(() => 0),
			"eye1",
			"Eye01",
		);
		const moved = moveFacePart(face, "eye1", { x: 20.2, y: -2.2 });

		expect(moved.parts.eye1).toMatchObject({ x: 9, y: 0 });
	});

	it("swaps colours when a plane selects the colour already in use", () => {
		const face = createRandomFace(() => 0);
		const changed = setFaceColor(face, "background", face.foreground);

		expect(changed.background).toBe(face.foreground);
		expect(changed.foreground).toBe(face.background);
	});

	it("keeps colours and locked features stable while randomising", () => {
		const locks = { ...DEFAULT_FACE_PART_LOCKS, eye1: true, nose: true };
		const changed = randomiseFace(DEFAULT_FACE, locks, () => 0.99);

		expect(changed.background).toBe(DEFAULT_FACE.background);
		expect(changed.foreground).toBe(DEFAULT_FACE.foreground);
		expect(changed.parts.eye1).toBe(DEFAULT_FACE.parts.eye1);
		expect(changed.parts.nose).toBe(DEFAULT_FACE.parts.nose);
		expect(changed.parts.mouth).not.toEqual(DEFAULT_FACE.parts.mouth);
	});

	it("can randomise eyes when an empty nose filter is locked", () => {
		const face = { ...DEFAULT_FACE, parts: { ...DEFAULT_FACE.parts, nose: null } };
		const locks = { ...DEFAULT_FACE_PART_LOCKS, nose: true, mouth: true };
		const changed = randomiseFace(face, locks, () => 0);

		expect(changed.parts.nose).toBeNull();
		expect(changed.parts.eye1).not.toBeNull();
		expect(changed.parts.eye2).not.toBeNull();
	});

	it("centres the current feature bounds on the half-grid", () => {
		const centred = centreFaceParts(DEFAULT_FACE);
		const placements = Object.values(centred.parts).filter(placement => placement !== null);
		const left = Math.min(...placements.map(placement => placement.x));
		const top = Math.min(...placements.map(placement => placement.y));
		const right = Math.max(
			...placements.map(placement => placement.x + getPartDefinition(placement.name).width),
		);
		const bottom = Math.max(
			...placements.map(placement => placement.y + getPartDefinition(placement.name).height),
		);

		expect((left + right) / 2).toBe(GRID_DIVISIONS / 2);
		expect((top + bottom) / 2).toBe(GRID_DIVISIONS / 2);
		placements.forEach(placement => {
			expect(placement.x * 2).toBe(Math.round(placement.x * 2));
			expect(placement.y * 2).toBe(Math.round(placement.y * 2));
		});
	});

	it("reproduces a randomised face from the same seed", () => {
		const first = randomiseFace(
			DEFAULT_FACE,
			DEFAULT_FACE_PART_LOCKS,
			createSeededRandom("hello humaan"),
		);
		const second = randomiseFace(
			DEFAULT_FACE,
			DEFAULT_FACE_PART_LOCKS,
			createSeededRandom("hello humaan"),
		);
		const different = randomiseFace(
			DEFAULT_FACE,
			DEFAULT_FACE_PART_LOCKS,
			createSeededRandom("another humaan"),
		);

		expect(first).toEqual(second);
		expect(first.parts).not.toEqual(different.parts);
	});
});
