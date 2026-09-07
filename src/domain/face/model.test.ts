import { describe, expect, it } from "vitest";
import {
	centreFaceParts,
	createRandomFace,
	DEFAULT_FACE,
	DEFAULT_FACE_PART_LOCKS,
	FACE_COLORS,
	facePartsCollide,
	GRID_DIVISIONS,
	moveFacePart,
	randomiseFace,
	selectFacePart,
	setFaceColor,
} from "./model";
import { getPartDefinition } from "./parts";

const sequenceRandom = (...values: number[]) => {
	let index = 0;

	return () => values[index++] ?? values.at(-1) ?? 0;
};

const repeatingRandom = (...values: number[]) => {
	let index = 0;

	return () => values[index++ % values.length];
};

const pseudoRandom = (seed: number) => {
	let state = seed;

	return () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;

		return state / 4294967296;
	};
};

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

	it("uses another available position when the preferred position collides", () => {
		const face: typeof DEFAULT_FACE = {
			...DEFAULT_FACE,
			parts: {
				eye1: { name: "Eye01", x: 3, y: 3, flipX: false, flipY: false },
				eye2: null,
				nose: null,
				mouth: null,
			},
		};
		const locks = { eye1: true, eye2: true, nose: false, mouth: true };
		const changed = randomiseFace(face, locks, sequenceRandom(0.34, 0, 0, 0));
		const nose = changed.parts.nose;

		expect(nose?.name).toBe("Nose07");
		expect(nose && (nose.x >= 5 || nose.y >= 5)).toBe(true);
	});

	it("allows bounding boxes to overlap where both parts have empty space", () => {
		const mouth = { name: "Mouth01", x: 6, y: 6, flipX: false, flipY: false } as const;
		const nose = { name: "Nose07", x: 6, y: 6, flipX: false, flipY: false } as const;

		expect(facePartsCollide(mouth, nose)).toBe(false);
	});

	it("mirrors asymmetric mouths across the face while keeping their open side inward", () => {
		const emptyFace: typeof DEFAULT_FACE = {
			...DEFAULT_FACE,
			parts: { eye1: null, eye2: null, nose: null, mouth: null },
		};
		const locks = { eye1: true, eye2: true, nose: true, mouth: false };
		const quarterMouth = randomiseFace(emptyFace, locks, sequenceRandom(0, 0.9, 0, 0, 0));
		const verticallyFlippedQuarter = randomiseFace(
			emptyFace,
			locks,
			sequenceRandom(0, 0.9, 0.9, 0, 0),
		);
		const diagonalMouth = randomiseFace(emptyFace, locks, sequenceRandom(0.6, 0.9, 0, 0, 0));
		const verticallyFlippedDiagonal = randomiseFace(
			emptyFace,
			locks,
			sequenceRandom(0.6, 0.9, 0.9, 0, 0),
		);

		expect(quarterMouth.parts.mouth).toMatchObject({ name: "Mouth01", flipX: true });
		expect(verticallyFlippedQuarter.parts.mouth).toMatchObject({
			name: "Mouth01",
			flipX: false,
			flipY: true,
		});
		expect(diagonalMouth.parts.mouth).toMatchObject({ name: "Mouth05", flipX: true, flipY: false });
		expect(verticallyFlippedDiagonal.parts.mouth).toMatchObject({
			name: "Mouth05",
			flipX: false,
			flipY: true,
		});
	});

	it("reorients vertically flipped asymmetric mouths after optical centring changes their side", () => {
		const leftHeavyFace: typeof DEFAULT_FACE = {
			...DEFAULT_FACE,
			parts: {
				eye1: { name: "Eye06", x: 0, y: 0, flipX: false, flipY: false },
				eye2: null,
				nose: null,
				mouth: null,
			},
		};
		const locks = { eye1: true, eye2: true, nose: true, mouth: false };
		const normalQuarter = randomiseFace(leftHeavyFace, locks, repeatingRandom(0, 0.1, 0.1, 0, 0));
		const verticalQuarter = randomiseFace(leftHeavyFace, locks, repeatingRandom(0, 0.1, 0.9, 0, 0));
		const normal = randomiseFace(leftHeavyFace, locks, repeatingRandom(0.6, 0.1, 0.1, 0, 0));
		const vertical = randomiseFace(leftHeavyFace, locks, repeatingRandom(0.6, 0.1, 0.9, 0, 0));

		expect(normalQuarter.parts.mouth).toMatchObject({
			name: "Mouth01",
			x: 6,
			flipX: false,
			flipY: false,
		});
		expect(verticalQuarter.parts.mouth).toMatchObject({
			name: "Mouth01",
			x: 6,
			flipX: true,
			flipY: true,
		});
		expect(normal.parts.mouth).toMatchObject({ name: "Mouth05", x: 6, flipX: true, flipY: false });
		expect(vertical.parts.mouth).toMatchObject({
			name: "Mouth05",
			x: 6,
			flipX: false,
			flipY: true,
		});
	});

	it("always assigns the leftmost generated eye to the left-eye slot", () => {
		const random = pseudoRandom(42);

		for (let index = 0; index < 250; index += 1) {
			const { eye1, eye2 } = createRandomFace(random).parts;

			if (!eye1 || !eye2) continue;

			const eye1Centre = eye1.x + getPartDefinition(eye1.name).width / 2;
			const eye2Centre = eye2.x + getPartDefinition(eye2.name).width / 2;
			expect(eye1Centre).toBeLessThanOrEqual(eye2Centre);
		}
	});

	it("centres the complete feature bounding box", () => {
		const face: typeof DEFAULT_FACE = {
			...DEFAULT_FACE,
			parts: {
				eye1: { name: "Eye06", x: 0, y: 3.5, flipX: false, flipY: false },
				eye2: { name: "Eye01", x: 9, y: 4.5, flipX: false, flipY: false },
				nose: null,
				mouth: null,
			},
		};
		const centred = centreFaceParts(face);
		const placements = Object.values(centred.parts).filter(placement => placement !== null);

		expect(centred.parts.eye1?.x).toBe(0);
		expect(centred.parts.eye2?.x).toBe(9);
		expect(centreFaceParts(centred)).toEqual(centred);
		placements.forEach(placement => {
			const definition = getPartDefinition(placement.name);

			expect(placement.x * 2).toBe(Math.round(placement.x * 2));
			expect(placement.y * 2).toBe(Math.round(placement.y * 2));
			expect(placement.x).toBeGreaterThanOrEqual(0);
			expect(placement.y).toBeGreaterThanOrEqual(0);
			expect(placement.x + definition.width).toBeLessThanOrEqual(GRID_DIVISIONS);
			expect(placement.y + definition.height).toBeLessThanOrEqual(GRID_DIVISIONS);
		});
	});

	it("centres feature bounds on both axes after randomisation", () => {
		const random = pseudoRandom(84);
		let maximumXError = 0;
		let maximumYError = 0;

		for (let index = 0; index < 100; index += 1) {
			const face = randomiseFace(DEFAULT_FACE, DEFAULT_FACE_PART_LOCKS, random);
			const placements = Object.values(face.parts).filter(placement => placement !== null);
			const left = Math.min(...placements.map(placement => placement.x));
			const top = Math.min(...placements.map(placement => placement.y));
			const right = Math.max(
				...placements.map(placement => placement.x + getPartDefinition(placement.name).width),
			);
			const bottom = Math.max(
				...placements.map(placement => placement.y + getPartDefinition(placement.name).height),
			);
			const boundsCentre = { x: (left + right) / 2, y: (top + bottom) / 2 };

			maximumXError = Math.max(maximumXError, Math.abs(boundsCentre.x - GRID_DIVISIONS / 2));
			maximumYError = Math.max(maximumYError, Math.abs(boundsCentre.y - GRID_DIVISIONS / 2));

			placements.forEach((placement, placementIndex) => {
				placements.slice(placementIndex + 1).forEach(otherPlacement => {
					expect(facePartsCollide(placement, otherPlacement)).toBe(false);
				});
			});
		}

		expect(maximumXError).toBeLessThanOrEqual(0.25);
		expect(maximumYError).toBeLessThanOrEqual(0.25);
	});
});
