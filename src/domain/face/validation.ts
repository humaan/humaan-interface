import {
	CANVAS_SIZE,
	FACE_COLORS,
	GRID_DIVISIONS,
	POSITION_STEP,
	type FaceColor,
	type FacePartKey,
	type FaceState,
	type PartPlacement,
} from "./model";
import { eyeParts, getPartDefinition, mouthParts, noseParts, type FacePartName } from "./parts";

const partNamesByKey: Record<FacePartKey, ReadonlySet<string>> = {
	eye1: new Set(eyeParts.map(part => part.name)),
	eye2: new Set(eyeParts.map(part => part.name)),
	nose: new Set(noseParts.map(part => part.name)),
	mouth: new Set(mouthParts.map(part => part.name)),
};

const facePartKeys = ["eye1", "eye2", "nose", "mouth"] as const satisfies readonly FacePartKey[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const isFaceColor = (value: unknown): value is FaceColor =>
	typeof value === "string" && FACE_COLORS.some(color => color === value);

const isStepAligned = (value: number) =>
	Math.abs(value / POSITION_STEP - Math.round(value / POSITION_STEP)) < Number.EPSILON * CANVAS_SIZE;

const parsePlacement = (value: unknown, key: FacePartKey): PartPlacement | null => {
	if (value === null) return null;
	if (!isRecord(value)) throw new TypeError(`Invalid ${key} placement.`);

	const { name, x, y, flipX, flipY } = value;
	if (typeof name !== "string" || !partNamesByKey[key].has(name)) {
		throw new TypeError(`Invalid ${key} part.`);
	}
	if (
		typeof x !== "number" ||
		!Number.isFinite(x) ||
		!isStepAligned(x) ||
		typeof y !== "number" ||
		!Number.isFinite(y) ||
		!isStepAligned(y)
	) {
		throw new TypeError(`Invalid ${key} position.`);
	}
	if (typeof flipX !== "boolean" || typeof flipY !== "boolean") {
		throw new TypeError(`Invalid ${key} flip state.`);
	}
	if (key !== "mouth" && flipY) {
		throw new TypeError(`Only mouths can be flipped vertically.`);
	}

	const definition = getPartDefinition(name as FacePartName);
	if (x < 0 || y < 0 || x + definition.width > GRID_DIVISIONS || y + definition.height > GRID_DIVISIONS) {
		throw new TypeError(`The ${key} is outside the face canvas.`);
	}

	return { name: name as FacePartName, x, y, flipX, flipY };
};

export const parseFaceState = (value: unknown): FaceState => {
	if (!isRecord(value) || !isRecord(value.parts)) {
		throw new TypeError("Invalid face state.");
	}
	const parts = value.parts;
	if (!isFaceColor(value.background) || !isFaceColor(value.foreground)) {
		throw new TypeError("Invalid face colours.");
	}
	if (value.background === value.foreground) {
		throw new TypeError("Face colours must contrast.");
	}

	return {
		background: value.background,
		foreground: value.foreground,
		parts: Object.fromEntries(
			facePartKeys.map(key => [key, parsePlacement(parts[key], key)]),
		) as FaceState["parts"],
	};
};
