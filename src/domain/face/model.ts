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

export const FACE_COLORS = ["#643A87", "#FFCA38", "#FBD0D1", "#99DAF4", "#F15744", "#DECFE6"] as const;

export type FaceColor = (typeof FACE_COLORS)[number];
export type FacePartKey = "eye1" | "eye2" | "nose" | "mouth";
export type ColorPlane = "background" | "foreground";

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

const getDefinitionBounds = (definition: FacePartDefinition, fallback: Bounds): Bounds => ({
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
	definition: FacePartDefinition,
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
	definition: FacePartDefinition,
	bounds: Bounds,
	random: (() => number) | null,
	allowFlipY: boolean,
): PartPlacement => ({
	name: definition.name as FacePartName,
	...placeWithinBounds(definition, bounds, random),
	flipX: random ? randomBoolean(random) : false,
	flipY: random && allowFlipY ? randomBoolean(random) : false,
});

const randomPlacement = (
	definitions: readonly FacePartDefinition[],
	bounds: Bounds,
	random: () => number,
	allowFlipY = false,
): PartPlacement | null => {
	const normalisedBounds = normaliseBounds(bounds);
	const availableParts = definitions.filter(
		definition =>
			definition.width <= normalisedBounds.width &&
			definition.height <= normalisedBounds.height,
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

export const createRandomFace = (random: () => number = Math.random): FaceState => {
	const background = randomItem(FACE_COLORS, random);
	const foreground = randomItem(
		FACE_COLORS.filter(color => color !== background),
		random,
	);

	const mouthDefinition: FacePartDefinition = randomItem(mouthParts, random);
	const mouth = createPlacement(
		mouthDefinition,
		getDefinitionBounds(mouthDefinition, defaultPartBounds.mouth),
		random,
		true,
	);

	let nose: PartPlacement | null = null;
	let eyeSlots = getPartSlots(mouth);

	if (!mouthDefinition.skipNose) {
		const noseDefinition: FacePartDefinition = randomItem(noseParts, random);
		nose = createPlacement(
			noseDefinition,
			getDefinitionBounds(noseDefinition, defaultPartBounds.nose),
			random,
			false,
		);
		eyeSlots = getPartSlots(nose);
	}

	return {
		background,
		foreground,
		parts: {
			eye1: eyeSlots[0] ? randomPlacement(eyeParts, eyeSlots[0], random) : null,
			eye2: eyeSlots[1] ? randomPlacement(eyeParts, eyeSlots[1], random) : null,
			nose,
			mouth,
		},
	};
};

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

export const togglePartFlip = (
	face: FaceState,
	key: FacePartKey,
	axis: "x" | "y",
): FaceState => {
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

export const setFaceColor = (
	face: FaceState,
	plane: ColorPlane,
	color: FaceColor,
): FaceState => {
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
