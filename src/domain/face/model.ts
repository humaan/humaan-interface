import {
	eyeParts,
	getPartDefinition,
	mouthParts,
	noseParts,
	type Bounds,
	type FacePartDefinition,
	type FacePartName,
} from "./parts";

export const GRID_DIVISIONS = 11;
export const FACE_PADDING = 3;
export const CANVAS_SIZE = GRID_DIVISIONS + FACE_PADDING * 2;
export const POSITION_STEP = 0.5;

export const FACE_COLORS = [
	"#643A87",
	"#FFCA38",
	"#FBD0D1",
	"#99DAF4",
	"#F15744",
	"#DECFE6",
] as const;

export type FaceColor = (typeof FACE_COLORS)[number];
export type FacePartKey = "eye1" | "eye2" | "nose" | "mouth";
export type ColorPlane = "background" | "foreground";
export type FacePartLocks = Record<FacePartKey, boolean>;

export type PartPlacement = {
	name: FacePartName;
	x: number;
	y: number;
	flipX: boolean;
	flipY: boolean;
};

export type FaceState = {
	background: FaceColor;
	foreground: FaceColor;
	parts: Record<FacePartKey, PartPlacement | null>;
};

export const DEFAULT_FACE: FaceState = {
	background: "#FBD0D1",
	foreground: "#643A87",
	parts: {
		eye1: { name: "Eye01", x: 1.5, y: 2, flipX: false, flipY: false },
		eye2: { name: "Eye05", x: 6.5, y: 1, flipX: false, flipY: false },
		nose: { name: "Nose05", x: 3, y: 4.5, flipX: false, flipY: false },
		mouth: { name: "Mouth02", x: 2, y: 8, flipX: false, flipY: false },
	},
};

export const DEFAULT_FACE_PART_LOCKS: FacePartLocks = {
	eye1: false,
	eye2: false,
	nose: false,
	mouth: false,
};

const defaultPartBounds: Record<FacePartKey, Bounds> = {
	eye1: { x: 0, y: 0, width: 5.5, height: 7 },
	eye2: { x: 5.5, y: 0, width: 5.5, height: 7 },
	nose: { x: 1, y: 0, width: 9, height: 8 },
	mouth: { x: 0, y: 6, width: 11, height: 5 },
};

const partOptions = {
	eye1: eyeParts,
	eye2: eyeParts,
	nose: noseParts,
	mouth: mouthParts,
} as const;

const clamp = (value: number, minimum: number, maximum: number) =>
	Math.min(Math.max(value, minimum), maximum);

const snap = (value: number) => Math.round(value / POSITION_STEP) * POSITION_STEP;

const randomItem = <T>(items: readonly T[], random: () => number): T => {
	const index = Math.min(items.length - 1, Math.floor(random() * items.length));
	return items[index];
};

const randomBoolean = (random: () => number) => random() >= 0.5;

export const createSeededRandom = (seed: string): (() => number) => {
	let state = 2166136261;

	for (let index = 0; index < seed.length; index += 1) {
		state ^= seed.charCodeAt(index);
		state = Math.imul(state, 16777619);
	}

	return () => {
		state += 0x6d2b79f5;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
};

const getDefinitionBounds = (
	definition: FacePartDefinition<FacePartName>,
	fallback: Bounds,
): Bounds => ({
	x: definition.boundX ?? fallback.x,
	y: definition.boundY ?? fallback.y,
	width: definition.boundW ?? fallback.width,
	height: definition.boundH ?? fallback.height,
});

export const normaliseBounds = (bounds: Bounds): Bounds => {
	const x = clamp(bounds.x, 0, GRID_DIVISIONS);
	const y = clamp(bounds.y, 0, GRID_DIVISIONS);
	const right = clamp(bounds.x + bounds.width, 0, GRID_DIVISIONS);
	const bottom = clamp(bounds.y + bounds.height, 0, GRID_DIVISIONS);

	return {
		x: Math.min(x, right),
		y: Math.min(y, bottom),
		width: Math.abs(right - x),
		height: Math.abs(bottom - y),
	};
};

const placeWithinBounds = (
	definition: FacePartDefinition<FacePartName>,
	bounds: Bounds,
	random: (() => number) | null,
): Pick<PartPlacement, "x" | "y"> => {
	const availableX = Math.max(0, bounds.width - definition.width);
	const availableY = Math.max(0, bounds.height - definition.height);
	const offsetX = random ? snap(random() * availableX) : snap(availableX / 2);
	const offsetY = random ? snap(random() * availableY) : snap(availableY / 2);

	return {
		x: clamp(bounds.x + offsetX, 0, GRID_DIVISIONS - definition.width),
		y: clamp(bounds.y + offsetY, 0, GRID_DIVISIONS - definition.height),
	};
};

const createPlacement = (
	definition: FacePartDefinition<FacePartName>,
	bounds: Bounds,
	random: (() => number) | null,
	allowFlipY: boolean,
): PartPlacement => ({
	name: definition.name,
	...placeWithinBounds(definition, bounds, random),
	flipX: random ? randomBoolean(random) : false,
	flipY: random && allowFlipY ? randomBoolean(random) : false,
});

const randomPlacement = (
	definitions: readonly FacePartDefinition<FacePartName>[],
	bounds: Bounds,
	random: () => number,
	allowFlipY = false,
): PartPlacement | null => {
	const normalisedBounds = normaliseBounds(bounds);
	const availableParts = definitions.filter(
		definition =>
			definition.width <= normalisedBounds.width && definition.height <= normalisedBounds.height,
	);

	if (availableParts.length === 0) {
		return null;
	}

	return createPlacement(randomItem(availableParts, random), normalisedBounds, random, allowFlipY);
};

const getPartSlots = (placement: PartPlacement): Bounds[] => {
	const definition = getPartDefinition(placement.name);

	return (definition.slots ?? []).map(slot => ({
		x: placement.flipX
			? placement.x + definition.width - slot.x - slot.width
			: placement.x + slot.x,
		y: placement.y + slot.y,
		width: slot.width,
		height: slot.height,
	}));
};

const createRandomParts = (
	currentParts: FaceState["parts"],
	locks: FacePartLocks,
	random: () => number,
): FaceState["parts"] => {
	const mouthDefinition: FacePartDefinition<FacePartName> = randomItem(mouthParts, random);
	const mouth = locks.mouth
		? currentParts.mouth
		: createPlacement(
				mouthDefinition,
				getDefinitionBounds(mouthDefinition, defaultPartBounds.mouth),
				random,
				true,
			);
	const activeMouthDefinition = mouth ? getPartDefinition(mouth.name) : null;

	let nose: PartPlacement | null;

	if (locks.nose) {
		nose = currentParts.nose;
	} else if (activeMouthDefinition?.skipNose) {
		nose = null;
	} else {
		const noseDefinition: FacePartDefinition<FacePartName> = randomItem(noseParts, random);
		nose = createPlacement(
			noseDefinition,
			getDefinitionBounds(noseDefinition, defaultPartBounds.nose),
			random,
			false,
		);
	}

	const eyeSlots = nose ? getPartSlots(nose) : mouth ? getPartSlots(mouth) : [];
	const useDefaultEyeBounds = eyeSlots.length === 0;
	const eye1Bounds = eyeSlots[0] ?? (useDefaultEyeBounds ? defaultPartBounds.eye1 : null);
	const eye2Bounds = eyeSlots[1] ?? (useDefaultEyeBounds ? defaultPartBounds.eye2 : null);

	return {
		eye1: locks.eye1
			? currentParts.eye1
			: eye1Bounds
				? randomPlacement(eyeParts, eye1Bounds, random)
				: null,
		eye2: locks.eye2
			? currentParts.eye2
			: eye2Bounds
				? randomPlacement(eyeParts, eye2Bounds, random)
				: null,
		nose,
		mouth,
	};
};

export const createRandomFace = (random: () => number = Math.random): FaceState => {
	const background = randomItem(FACE_COLORS, random);
	const foreground = randomItem(
		FACE_COLORS.filter(color => color !== background),
		random,
	);

	return {
		background,
		foreground,
		parts: createRandomParts(DEFAULT_FACE.parts, DEFAULT_FACE_PART_LOCKS, random),
	};
};

export const randomiseFace = (
	face: FaceState,
	locks: FacePartLocks,
	random: () => number = Math.random,
): FaceState => ({
	...face,
	parts: createRandomParts(face.parts, locks, random),
});

export const selectFacePart = (
	face: FaceState,
	key: FacePartKey,
	name: FacePartName | null,
): FaceState => {
	if (!name) {
		return { ...face, parts: { ...face.parts, [key]: null } };
	}

	const definition = getPartDefinition(name);
	const isValidOption = partOptions[key].some(part => part.name === name);

	if (!isValidOption) {
		return face;
	}

	const currentPlacement = face.parts[key];
	const bounds = getDefinitionBounds(definition, defaultPartBounds[key]);
	const position = currentPlacement
		? {
				x: snap(
					clamp(
						currentPlacement.x +
							(getPartDefinition(currentPlacement.name).width - definition.width) / 2,
						0,
						GRID_DIVISIONS - definition.width,
					),
				),
				y: snap(
					clamp(
						currentPlacement.y +
							(getPartDefinition(currentPlacement.name).height - definition.height) / 2,
						0,
						GRID_DIVISIONS - definition.height,
					),
				),
			}
		: placeWithinBounds(definition, bounds, null);

	return {
		...face,
		parts: {
			...face.parts,
			[key]: {
				name,
				...position,
				flipX: currentPlacement?.flipX ?? false,
				flipY: key === "mouth" ? (currentPlacement?.flipY ?? false) : false,
			},
		},
	};
};

export const togglePartFlip = (face: FaceState, key: FacePartKey, axis: "x" | "y"): FaceState => {
	const placement = face.parts[key];

	if (!placement || (axis === "y" && key !== "mouth")) {
		return face;
	}

	return {
		...face,
		parts: {
			...face.parts,
			[key]: {
				...placement,
				flipX: axis === "x" ? !placement.flipX : placement.flipX,
				flipY: axis === "y" ? !placement.flipY : placement.flipY,
			},
		},
	};
};

export const moveFacePart = (
	face: FaceState,
	key: FacePartKey,
	position: Pick<PartPlacement, "x" | "y">,
): FaceState => {
	const placement = face.parts[key];

	if (!placement) {
		return face;
	}

	const definition = getPartDefinition(placement.name);

	return {
		...face,
		parts: {
			...face.parts,
			[key]: {
				...placement,
				x: snap(clamp(position.x, 0, GRID_DIVISIONS - definition.width)),
				y: snap(clamp(position.y, 0, GRID_DIVISIONS - definition.height)),
			},
		},
	};
};

export const centreFaceParts = (face: FaceState): FaceState => {
	const placements = Object.values(face.parts).filter(
		(placement): placement is PartPlacement => placement !== null,
	);

	if (placements.length === 0) {
		return face;
	}

	const left = Math.min(...placements.map(placement => placement.x));
	const top = Math.min(...placements.map(placement => placement.y));
	const right = Math.max(
		...placements.map(placement => placement.x + getPartDefinition(placement.name).width),
	);
	const bottom = Math.max(
		...placements.map(placement => placement.y + getPartDefinition(placement.name).height),
	);
	const offsetX = snap(GRID_DIVISIONS / 2 - (left + right) / 2);
	const offsetY = snap(GRID_DIVISIONS / 2 - (top + bottom) / 2);

	return {
		...face,
		parts: Object.fromEntries(
			Object.entries(face.parts).map(([key, placement]) => [
				key,
				placement
					? {
							...placement,
							x: snap(placement.x + offsetX),
							y: snap(placement.y + offsetY),
						}
					: null,
			]),
		) as FaceState["parts"],
	};
};

export const setFaceColor = (face: FaceState, plane: ColorPlane, color: FaceColor): FaceState => {
	if (face[plane] === color) {
		return face;
	}

	const otherPlane = plane === "background" ? "foreground" : "background";

	if (face[otherPlane] === color) {
		return {
			...face,
			[plane]: color,
			[otherPlane]: face[plane],
		};
	}

	return { ...face, [plane]: color };
};
