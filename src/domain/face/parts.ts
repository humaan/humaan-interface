export type Bounds = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type FacePartDefinition<Name extends string = string> = {
	name: Name;
	width: number;
	height: number;
	boundX?: number;
	boundY?: number;
	boundW?: number;
	boundH?: number;
	slots?: readonly Bounds[];
	collisionZones?: readonly Bounds[];
	directionAwareFlipX?: "same" | "inverse-when-flipped-y";
	skipNose?: boolean;
};

const ringCollisionZones = (width: number, height: number): readonly Bounds[] => [
	{ x: 0, y: 0, width, height: 1 },
	{ x: 0, y: height - 1, width, height: 1 },
	{ x: 0, y: 1, width: 1, height: height - 2 },
	{ x: width - 1, y: 1, width: 1, height: height - 2 },
];

const shallowArcCollisionZones = (width: number, height: number): readonly Bounds[] => [
	{ x: 0, y: 0, width: width / 4, height: height * 0.65 },
	{ x: width / 4, y: height * 0.35, width: width / 2, height: height * 0.65 },
	{ x: width * 0.75, y: 0, width: width / 4, height: height * 0.65 },
];

const diagonalCollisionZones = (size: number): readonly Bounds[] => [
	{ x: 0, y: 0, width: size * 0.4, height: size * 0.4 },
	{ x: size * 0.3, y: size * 0.3, width: size * 0.4, height: size * 0.4 },
	{ x: size * 0.6, y: size * 0.6, width: size * 0.4, height: size * 0.4 },
];

const quarterArcCollisionZones = (size: number): readonly Bounds[] => [
	{ x: size * 0.7, y: 0, width: size * 0.3, height: size * 0.4 },
	{ x: size * 0.45, y: size * 0.45, width: size * 0.35, height: size * 0.35 },
	{ x: 0, y: size * 0.7, width: size * 0.4, height: size * 0.3 },
];

export const eyeParts = [
	{
		name: "Eye01",
		width: 2,
		height: 2,
	},
	{
		name: "Eye02",
		width: 4,
		height: 2,
		collisionZones: shallowArcCollisionZones(4, 2),
	},
	{
		name: "Eye03",
		width: 3,
		height: 5,
		collisionZones: [
			{ x: 0, y: 0, width: 3, height: 1 },
			...ringCollisionZones(3, 3).map(zone => ({ ...zone, y: zone.y + 2 })),
		],
	},
	{
		name: "Eye04",
		width: 4,
		height: 6,
	},
	{
		name: "Eye05",
		width: 4,
		height: 4,
		collisionZones: ringCollisionZones(4, 4),
	},
	{
		name: "Eye06",
		width: 4,
		height: 4,
	},
] as const satisfies readonly FacePartDefinition[];

export const noseParts = [
	{
		name: "Nose01",
		width: 7,
		height: 6,
		collisionZones: [
			{ x: 0, y: 0, width: 4, height: 1 },
			{ x: 3, y: 1, width: 1, height: 4 },
			{ x: 3, y: 5, width: 4, height: 1 },
		],
		boundX: 1,
		boundY: 0,
		boundW: 9,
		boundH: 8,
		slots: [
			{
				x: -9,
				y: 2,
				width: 11,
				height: 4,
			},
			{
				x: 5,
				y: -7,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose02",
		width: 5,
		height: 6,
		collisionZones: [
			{ x: 2, y: 0, width: 1, height: 5 },
			{ x: 0, y: 5, width: 5, height: 1 },
		],
		boundX: 2,
		boundY: 0,
		boundW: 7,
		boundH: 8,
		slots: [
			{
				x: -10,
				y: -7,
				width: 11,
				height: 11,
			},
			{
				x: 5,
				y: -7,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose03",
		width: 4,
		height: 2,
		collisionZones: shallowArcCollisionZones(4, 2),
		boundX: 2,
		boundY: 4,
		boundW: 7,
		boundH: 4,
		slots: [
			{
				x: -9.5,
				y: -12,
				width: 11,
				height: 11,
			},
			{
				x: 2.5,
				y: -12,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose04",
		width: 4,
		height: 4,
		collisionZones: [
			{ x: 0, y: 0, width: 1, height: 3 },
			{ x: 1, y: 3, width: 2, height: 1 },
			{ x: 3, y: 2, width: 1, height: 1 },
		],
		boundX: 3,
		boundY: 2,
		boundW: 5,
		boundH: 6,
		slots: [
			{
				x: -12,
				y: -8,
				width: 11,
				height: 11,
			},
			{
				x: 2,
				y: -10,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose05",
		width: 5,
		height: 3,
		collisionZones: [
			{ x: 2, y: 0, width: 1, height: 2 },
			{ x: 0, y: 2, width: 5, height: 1 },
		],
		boundX: 2,
		boundY: 3,
		boundW: 7,
		boundH: 5,
		slots: [
			{
				x: -10,
				y: -10,
				width: 11,
				height: 11,
			},
			{
				x: 4,
				y: -10,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose06",
		width: 5,
		height: 5,
		collisionZones: diagonalCollisionZones(5),
		boundX: 2,
		boundY: 3,
		boundW: 7,
		boundH: 5,
		slots: [
			{
				x: -9,
				y: -11,
				width: 11,
				height: 11,
			},
			{
				x: 3,
				y: -11,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose07",
		width: 2,
		height: 2,
		boundX: 3,
		boundY: 3,
		boundW: 5,
		boundH: 5,
		slots: [
			{
				x: -10.5,
				y: -12,
				width: 11,
				height: 11,
			},
			{
				x: 1.5,
				y: -12,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose08",
		width: 4,
		height: 7,
		collisionZones: [
			{ x: 0, y: 0, width: 1, height: 6 },
			{ x: 0, y: 6, width: 4, height: 1 },
		],
		boundX: 4,
		boundY: 0,
		boundW: 6,
		boundH: 8,
		slots: [
			{
				x: -12,
				y: -5,
				width: 11,
				height: 11,
			},
			{
				x: 2,
				y: -7,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose09",
		width: 4,
		height: 4,
		collisionZones: ringCollisionZones(4, 4),
		boundX: 3,
		boundY: 3,
		boundW: 5,
		boundH: 5,
		slots: [
			{
				x: -9.5,
				y: -12,
				width: 11,
				height: 11,
			},
			{
				x: 2.5,
				y: -12,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose10",
		width: 8,
		height: 4,
		boundX: 1,
		boundY: 3,
		boundW: 9,
		boundH: 5,
		slots: [
			{
				x: -7.5,
				y: -12,
				width: 11,
				height: 11,
			},
			{
				x: 4.5,
				y: -12,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose11",
		width: 4,
		height: 7,
		boundX: 3,
		boundY: 0,
		boundW: 5,
		boundH: 8,
		slots: [
			{
				x: -11.5,
				y: -5,
				width: 11,
				height: 11,
			},
			{
				x: 4.5,
				y: -5,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Nose12",
		width: 3,
		height: 3,
		collisionZones: [
			{ x: 1, y: 0, width: 1, height: 2 },
			{ x: 0, y: 2, width: 3, height: 1 },
		],
		boundX: 3,
		boundY: 2,
		boundW: 5,
		boundH: 6,
		slots: [
			{
				x: -11,
				y: -10,
				width: 11,
				height: 11,
			},
			{
				x: 3,
				y: -10,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "NoseEye01",
		width: 7,
		height: 6,
		collisionZones: [
			...shallowArcCollisionZones(4, 2),
			{ x: 3, y: 2, width: 1, height: 3 },
			{ x: 4, y: 5, width: 2, height: 1 },
			{ x: 6, y: 4, width: 1, height: 1 },
		],
		boundX: 0,
		boundY: 0,
		boundW: 9,
		boundH: 8,
		slots: [
			{
				x: 5,
				y: -8,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "NoseEye02",
		width: 7,
		height: 6,
		collisionZones: [
			{ x: 0, y: 0, width: 4, height: 1 },
			{ x: 3, y: 1, width: 1, height: 4 },
			{ x: 4, y: 5, width: 2, height: 1 },
			{ x: 6, y: 4, width: 1, height: 1 },
		],
		boundX: 0,
		boundY: 0,
		boundW: 9,
		boundH: 8,
		slots: [
			{
				x: 5,
				y: -8,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "NoseEye03",
		width: 7,
		height: 6,
		collisionZones: [
			...shallowArcCollisionZones(4, 2),
			{ x: 3, y: 2, width: 1, height: 3 },
			{ x: 4, y: 3, width: 3, height: 1 },
			{ x: 4, y: 5, width: 2, height: 1 },
			{ x: 6, y: 4, width: 1, height: 1 },
		],
		boundX: 0,
		boundY: 1,
		boundW: 9,
		boundH: 7,
		slots: [
			{
				x: 5,
				y: -9,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "NoseEye04",
		width: 7,
		height: 6,
		collisionZones: [
			...shallowArcCollisionZones(4, 2),
			{ x: 3, y: 2, width: 1, height: 4 },
			{ x: 4, y: 5, width: 3, height: 1 },
		],
		boundX: 0,
		boundY: 0,
		boundW: 9,
		boundH: 8,
		slots: [
			{
				x: 5,
				y: -7,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "NoseEye05",
		width: 4,
		height: 7,
		boundX: 1,
		boundY: 0,
		boundW: 5,
		boundH: 8,
		slots: [
			{
				x: 5,
				y: -6,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "NoseEye06",
		width: 7,
		height: 7,
		collisionZones: [
			...shallowArcCollisionZones(4, 2),
			{ x: 3, y: 2, width: 1, height: 4 },
			{ x: 4, y: 6, width: 2, height: 1 },
			{ x: 6, y: 5, width: 1, height: 1 },
		],
		boundX: 0,
		boundY: 0,
		boundW: 9,
		boundH: 9,
		slots: [
			{
				x: 5,
				y: -7,
				width: 11,
				height: 11,
			},
		],
	},
] as const satisfies readonly FacePartDefinition[];

export const mouthParts = [
	{
		name: "Mouth01",
		width: 5,
		height: 5,
		collisionZones: quarterArcCollisionZones(5),
		directionAwareFlipX: "inverse-when-flipped-y",
		boundX: 6,
		boundY: 6,
		boundW: 5,
		boundH: 5,
	},
	{
		name: "Mouth02",
		width: 7,
		height: 3,
		collisionZones: shallowArcCollisionZones(7, 3),
		boundX: 1,
		boundY: 8,
		boundW: 9,
		boundH: 3,
	},
	{
		name: "Mouth03",
		width: 10,
		height: 5,
		collisionZones: shallowArcCollisionZones(10, 5),
		boundX: 0.5,
		boundY: 6,
		boundW: 10,
		boundH: 5,
		skipNose: true,
		slots: [
			{
				x: 5.5,
				y: -12,
				width: 11,
				height: 11,
			},
			{
				x: -6.5,
				y: -12,
				width: 11,
				height: 11,
			},
		],
	},
	{
		name: "Mouth04",
		width: 2,
		height: 2,
		boundX: 1,
		boundY: 9,
		boundW: 9,
		boundH: 2,
	},
	{
		name: "Mouth05",
		width: 5,
		height: 5,
		collisionZones: diagonalCollisionZones(5),
		directionAwareFlipX: "inverse-when-flipped-y",
		boundX: 0,
		boundY: 6,
		boundW: 5,
		boundH: 5,
	},
	{
		name: "Mouth06",
		width: 5,
		height: 1,
		boundX: 1,
		boundY: 9,
		boundW: 9,
		boundH: 2,
	},
	{
		name: "Mouth07",
		width: 4,
		height: 2,
		collisionZones: shallowArcCollisionZones(4, 2),
		boundX: 1,
		boundY: 9,
		boundW: 9,
		boundH: 2,
	},
] as const satisfies readonly FacePartDefinition[];

export type EyePartName = (typeof eyeParts)[number]["name"];
export type NosePartName = (typeof noseParts)[number]["name"];
export type MouthPartName = (typeof mouthParts)[number]["name"];
export type FacePartName = EyePartName | NosePartName | MouthPartName;

const partLookup = new Map<FacePartName, FacePartDefinition<FacePartName>>(
	[...eyeParts, ...noseParts, ...mouthParts].map(part => [part.name, part]),
);

export const getPartDefinition = (name: FacePartName): FacePartDefinition<FacePartName> => {
	const part = partLookup.get(name);

	if (!part) {
		throw new Error(`Unknown face part: ${name}`);
	}

	return part;
};
