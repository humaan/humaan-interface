import { describe, expect, it } from "vitest";
import {
	createRandomFace,
	FACE_COLORS,
	GRID_DIVISIONS,
	moveFacePart,
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
		const face = selectFacePart(createRandomFace(() => 0), "eye1", "Eye01");
		const moved = moveFacePart(face, "eye1", { x: 20.2, y: -2.2 });

		expect(moved.parts.eye1).toMatchObject({ x: 9, y: 0 });
	});

	it("swaps colours when a plane selects the colour already in use", () => {
		const face = createRandomFace(() => 0);
		const changed = setFaceColor(face, "background", face.foreground);

		expect(changed.background).toBe(face.foreground);
		expect(changed.foreground).toBe(face.background);
	});
});
