import {
	eyeParts,
	facePartOpticalMass,
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

const getCollisionZones = (placement: PartPlacement): Bounds[] => {
	const definition = getPartDefinition(placement.name);
	const padding = definition.collisionZones ? POSITION_STEP / 2 : 0;
	const zones = definition.collisionZones ?? [
		{ x: 0, y: 0, width: definition.width, height: definition.height },
	];

	return zones.map(zone => ({
		x: placement.x + (placement.flipX ? definition.width - zone.x - zone.width : zone.x) - padding,
		y:
			placement.y + (placement.flipY ? definition.height - zone.y - zone.height : zone.y) - padding,
		width: zone.width + padding * 2,
		height: zone.height + padding * 2,
	}));
};

const getIntersectionArea = (first: Bounds, second: Bounds) => {
	const width =
		Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x);
	const height =
		Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y);

	return Math.max(0, width) * Math.max(0, height);
};

const getCollisionScore = (placement: PartPlacement, obstacles: readonly PartPlacement[]) =>
	getCollisionZones(placement).reduce(
		(total, zone) =>
			total +
			obstacles.reduce(
				(obstacleTotal, obstacle) =>
					obstacleTotal +
					getCollisionZones(obstacle).reduce(
						(zoneTotal, obstacleZone) => zoneTotal + getIntersectionArea(zone, obstacleZone),
						0,
					),
				0,
			),
		0,
	);

export const facePartsCollide = (first: PartPlacement, second: PartPlacement) =>
	getCollisionScore(first, [second]) > 0;

const getPlacementOptions = (
	definition: FacePartDefinition<FacePartName>,
	bounds: Bounds,
): Pick<PartPlacement, "x" | "y">[] => {
	const availableX = Math.max(0, bounds.width - definition.width);
	const availableY = Math.max(0, bounds.height - definition.height);
	const xSteps = Math.floor(availableX / POSITION_STEP) + 1;
	const ySteps = Math.floor(availableY / POSITION_STEP) + 1;

	return Array.from({ length: ySteps }, (_, yIndex) =>
		Array.from({ length: xSteps }, (_, xIndex) => ({
			x: snap(bounds.x + xIndex * POSITION_STEP),
			y: snap(bounds.y + yIndex * POSITION_STEP),
		})),
	).flat();
};

const placeAvoidingCollisions = (
	definition: FacePartDefinition<FacePartName>,
	bounds: Bounds,
	random: (() => number) | null,
	flipX: boolean,
	flipY: boolean,
	obstacles: readonly PartPlacement[],
): Pick<PartPlacement, "x" | "y"> => {
	const preferredPosition = placeWithinBounds(definition, bounds, random);

	if (obstacles.length === 0) {
		return preferredPosition;
	}

	const positions = getPlacementOptions(definition, bounds);
	const preferredIndex = positions.findIndex(
		position => position.x === preferredPosition.x && position.y === preferredPosition.y,
	);
	const orderedPositions = [
		...positions.slice(Math.max(0, preferredIndex)),
		...positions.slice(0, Math.max(0, preferredIndex)),
	];
	let bestPosition = preferredPosition;
	let bestScore = Number.POSITIVE_INFINITY;

	for (const position of orderedPositions) {
		const score = getCollisionScore(
			{ name: definition.name, ...position, flipX, flipY },
			obstacles,
		);

		if (score === 0) {
			return position;
		}

		if (score < bestScore) {
			bestPosition = position;
			bestScore = score;
		}
	}

	return bestPosition;
};

const createPlacement = (
	definition: FacePartDefinition<FacePartName>,
	bounds: Bounds,
	random: (() => number) | null,
	allowFlipY: boolean,
	obstacles: readonly PartPlacement[] = [],
): PartPlacement => {
	const horizontalVariant = random ? randomBoolean(random) : false;
	const flipY = random && allowFlipY ? randomBoolean(random) : false;
	const flipX =
		definition.directionAwareFlipX === "inverse-when-flipped-y" && flipY
			? !horizontalVariant
			: horizontalVariant;
	const placementBounds = normaliseBounds(
		definition.directionAwareFlipX && horizontalVariant
			? { ...bounds, x: GRID_DIVISIONS - bounds.x - bounds.width }
			: bounds,
	);

	return {
		name: definition.name,
		...placeAvoidingCollisions(definition, placementBounds, random, flipX, flipY, obstacles),
		flipX,
		flipY,
	};
};

const randomPlacement = (
	definitions: readonly FacePartDefinition<FacePartName>[],
	bounds: Bounds | ((definition: FacePartDefinition<FacePartName>) => Bounds),
	random: () => number,
	allowFlipY = false,
	obstacles: readonly PartPlacement[] = [],
): PartPlacement | null => {
	const availableParts: Array<{
		definition: FacePartDefinition<FacePartName>;
		bounds: Bounds;
	}> = [];

	definitions.forEach(definition => {
		const partBounds = normaliseBounds(typeof bounds === "function" ? bounds(definition) : bounds);

		if (definition.width <= partBounds.width && definition.height <= partBounds.height) {
			availableParts.push({ definition, bounds: partBounds });
		}
	});

	if (availableParts.length === 0) {
		return null;
	}

	const startIndex = Math.min(
		availableParts.length - 1,
		Math.floor(random() * availableParts.length),
	);
	const orderedParts = [
		...availableParts.slice(startIndex),
		...availableParts.slice(0, startIndex),
	];
	let bestPlacement: PartPlacement | null = null;
	let bestScore = Number.POSITIVE_INFINITY;

	for (const option of orderedParts) {
		const placement = createPlacement(
			option.definition,
			option.bounds,
			random,
			allowFlipY,
			obstacles,
		);
		const score = getCollisionScore(placement, obstacles);

		if (score === 0) {
			return placement;
		}

		if (score < bestScore) {
			bestPlacement = placement;
			bestScore = score;
		}
	}

	return bestPlacement;
};

const getPartSlots = (placement: PartPlacement): Bounds[] => {
	const definition = getPartDefinition(placement.name);

	return (definition.slots ?? [])
		.map(slot => ({
			x: placement.flipX
				? placement.x + definition.width - slot.x - slot.width
				: placement.x + slot.x,
			y: placement.y + slot.y,
			width: slot.width,
			height: slot.height,
		}))
		.sort((first, second) => first.x - second.x);
};

const compactPlacements = (...placements: Array<PartPlacement | null>): PartPlacement[] =>
	placements.filter((placement): placement is PartPlacement => placement !== null);

const createRandomParts = (
	currentParts: FaceState["parts"],
	locks: FacePartLocks,
	random: () => number,
): FaceState["parts"] => {
	const mouth = locks.mouth
		? currentParts.mouth
		: randomPlacement(
				mouthParts,
				definition => getDefinitionBounds(definition, defaultPartBounds.mouth),
				random,
				true,
				compactPlacements(
					locks.eye1 ? currentParts.eye1 : null,
					locks.eye2 ? currentParts.eye2 : null,
					locks.nose ? currentParts.nose : null,
				),
			);
	const activeMouthDefinition = mouth ? getPartDefinition(mouth.name) : null;

	let nose: PartPlacement | null;

	if (locks.nose) {
		nose = currentParts.nose;
	} else if (activeMouthDefinition?.skipNose) {
		nose = null;
	} else {
		nose = randomPlacement(
			noseParts,
			definition => getDefinitionBounds(definition, defaultPartBounds.nose),
			random,
			false,
			compactPlacements(
				mouth,
				locks.eye1 ? currentParts.eye1 : null,
				locks.eye2 ? currentParts.eye2 : null,
			),
		);
	}

	const eyeSlots = nose ? getPartSlots(nose) : mouth ? getPartSlots(mouth) : [];
	const useDefaultEyeBounds = eyeSlots.length === 0;
	const eye1Bounds = eyeSlots[0] ?? (useDefaultEyeBounds ? defaultPartBounds.eye1 : null);
	const eye2Bounds = eyeSlots[1] ?? (useDefaultEyeBounds ? defaultPartBounds.eye2 : null);

	const eye1 = locks.eye1
		? currentParts.eye1
		: eye1Bounds
			? randomPlacement(
					eyeParts,
					eye1Bounds,
					random,
					false,
					compactPlacements(mouth, nose, locks.eye2 ? currentParts.eye2 : null),
				)
			: null;
	const eye2 = locks.eye2
		? currentParts.eye2
		: eye2Bounds
			? randomPlacement(eyeParts, eye2Bounds, random, false, compactPlacements(mouth, nose, eye1))
			: null;

	return {
		eye1,
		eye2,
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
): FaceState => {
	const canvasCentre = GRID_DIVISIONS / 2;
	let bestFace: FaceState | null = null;
	let bestCollisionScore = Number.POSITIVE_INFINITY;
	let bestOpticalDistance = Number.POSITIVE_INFINITY;

	for (let attempt = 0; attempt < 8; attempt += 1) {
		const candidate = centreFacePartsWithLocks(
			{
				...face,
				parts: createRandomParts(face.parts, locks, random),
			},
			locks,
			true,
		);
		const placements = compactPlacements(...Object.values(candidate.parts));
		const collisionScore = getTotalCollisionScore(placements);
		const opticalCentre = getOpticalCentre(placements);
		const opticalDistance =
			(opticalCentre.x - canvasCentre) ** 2 + (opticalCentre.y - canvasCentre) ** 2;

		if (
			collisionScore < bestCollisionScore ||
			(collisionScore === bestCollisionScore && opticalDistance < bestOpticalDistance)
		) {
			bestFace = candidate;
			bestCollisionScore = collisionScore;
			bestOpticalDistance = opticalDistance;
		}

		if (collisionScore === 0 && opticalDistance <= 0.125) break;
	}

	return bestFace ?? face;
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

const CENTERING_OFFSETS = Array.from(
	{ length: (GRID_DIVISIONS * 2) / POSITION_STEP + 1 },
	(_, index) => index * POSITION_STEP - GRID_DIVISIONS,
);

const getOpticalCentre = (placements: readonly PartPlacement[]) => {
	let totalArea = 0;
	let xMoment = 0;
	let yMoment = 0;

	placements.forEach(placement => {
		const definition = getPartDefinition(placement.name);
		const opticalMass = facePartOpticalMass[placement.name];
		const localX = placement.flipX ? definition.width - opticalMass.x : opticalMass.x;
		const localY = placement.flipY ? definition.height - opticalMass.y : opticalMass.y;

		totalArea += opticalMass.area;
		xMoment += (placement.x + localX) * opticalMass.area;
		yMoment += (placement.y + localY) * opticalMass.area;
	});

	return totalArea
		? { x: xMoment / totalArea, y: yMoment / totalArea }
		: { x: GRID_DIVISIONS / 2, y: GRID_DIVISIONS / 2 };
};

export const getFaceOpticalCentre = (face: FaceState) =>
	getOpticalCentre(compactPlacements(...Object.values(face.parts)));

const getTotalCollisionScore = (placements: readonly PartPlacement[]) =>
	placements.reduce(
		(total, placement, index) => total + getCollisionScore(placement, placements.slice(index + 1)),
		0,
	);

const orientDirectionAwarePlacement = (placement: PartPlacement): PartPlacement => {
	const definition = getPartDefinition(placement.name);

	if (!definition.directionAwareFlipX) {
		return placement;
	}

	const baseCentre = (definition.boundX ?? 0) + definition.width / 2;
	const placementCentre = placement.x + definition.width / 2;
	const canvasCentre = GRID_DIVISIONS / 2;

	if (placementCentre === canvasCentre) {
		return placement;
	}

	const mirroredPosition = baseCentre < canvasCentre !== placementCentre < canvasCentre;
	const flipX =
		definition.directionAwareFlipX === "inverse-when-flipped-y" && placement.flipY
			? !mirroredPosition
			: mirroredPosition;

	return flipX === placement.flipX ? placement : { ...placement, flipX };
};

const offsetFaceParts = (
	parts: FaceState["parts"],
	locks: FacePartLocks,
	offsetX: number,
	offsetY: number,
	orientDirectionAwareParts: boolean,
): FaceState["parts"] => {
	const nextParts = { ...parts };

	(Object.keys(nextParts) as FacePartKey[]).forEach(key => {
		const placement = nextParts[key];

		if (!placement || locks[key]) return;

		const definition = getPartDefinition(placement.name);
		const movedPlacement = {
			...placement,
			x: snap(clamp(placement.x + offsetX, 0, GRID_DIVISIONS - definition.width)),
			y: snap(clamp(placement.y + offsetY, 0, GRID_DIVISIONS - definition.height)),
		};

		nextParts[key] = orientDirectionAwareParts
			? orientDirectionAwarePlacement(movedPlacement)
			: movedPlacement;
	});

	return nextParts;
};

const centreFacePartsWithLocks = (
	face: FaceState,
	locks: FacePartLocks,
	orientDirectionAwareParts: boolean,
): FaceState => {
	const hasMovablePlacement = (Object.keys(face.parts) as FacePartKey[]).some(
		key => face.parts[key] && !locks[key],
	);

	if (!hasMovablePlacement) {
		return face;
	}

	const canvasCentre = GRID_DIVISIONS / 2;
	const stationaryParts = offsetFaceParts(face.parts, locks, 0, 0, orientDirectionAwareParts);
	const stationaryPlacements = compactPlacements(...Object.values(stationaryParts));
	const maximumCollisionScore = getTotalCollisionScore(stationaryPlacements);
	const stationaryOpticalCentre = getOpticalCentre(stationaryPlacements);
	let bestParts = stationaryParts;
	let bestCollisionScore = maximumCollisionScore;
	let bestOpticalDistance =
		(stationaryOpticalCentre.x - canvasCentre) ** 2 +
		(stationaryOpticalCentre.y - canvasCentre) ** 2;
	let bestMovement = 0;

	CENTERING_OFFSETS.forEach(offsetX => {
		CENTERING_OFFSETS.forEach(offsetY => {
			const candidateParts = offsetFaceParts(
				face.parts,
				locks,
				offsetX,
				offsetY,
				orientDirectionAwareParts,
			);
			const placements = compactPlacements(...Object.values(candidateParts));
			const collisionScore = getTotalCollisionScore(placements);
			const opticalCentre = getOpticalCentre(placements);
			const opticalDistance =
				(opticalCentre.x - canvasCentre) ** 2 + (opticalCentre.y - canvasCentre) ** 2;
			const movement = Math.abs(offsetX) + Math.abs(offsetY);

			if (collisionScore > maximumCollisionScore) return;

			const isOpticallyCloser = opticalDistance < bestOpticalDistance;
			const isEquallyClose = opticalDistance === bestOpticalDistance;
			const hasLessCollision = collisionScore < bestCollisionScore;
			const hasEqualCollision = collisionScore === bestCollisionScore;

			if (
				isOpticallyCloser ||
				(isEquallyClose && hasLessCollision) ||
				(isEquallyClose && hasEqualCollision && movement < bestMovement)
			) {
				bestParts = candidateParts;
				bestCollisionScore = collisionScore;
				bestOpticalDistance = opticalDistance;
				bestMovement = movement;
			}
		});
	});

	return { ...face, parts: bestParts };
};

export const centreFaceParts = (face: FaceState): FaceState =>
	centreFacePartsWithLocks(face, DEFAULT_FACE_PART_LOCKS, false);

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
