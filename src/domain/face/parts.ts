import type { ComponentType, SVGProps } from "react";

export type Bounds = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type FacePartDefinition = {
	name: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	width: number;
	height: number;
	boundX?: number;
	boundY?: number;
	boundW?: number;
	boundH?: number;
	slots?: readonly Bounds[];
	skipNose?: boolean;
};

// Eyes
import Eye01 from "../../assets/face-parts/eyes/01.svg";
import Eye02 from "../../assets/face-parts/eyes/02.svg";
import Eye03 from "../../assets/face-parts/eyes/03.svg";
import Eye04 from "../../assets/face-parts/eyes/04.svg";
import Eye05 from "../../assets/face-parts/eyes/05.svg";
import Eye06 from "../../assets/face-parts/eyes/06.svg";

// Nose
import Nose01 from "../../assets/face-parts/nose/01.svg";
import Nose02 from "../../assets/face-parts/nose/02.svg";
import Nose03 from "../../assets/face-parts/nose/03.svg";
import Nose04 from "../../assets/face-parts/nose/04.svg";
import Nose05 from "../../assets/face-parts/nose/05.svg";
import Nose06 from "../../assets/face-parts/nose/06.svg";
import Nose07 from "../../assets/face-parts/nose/07.svg";
import Nose08 from "../../assets/face-parts/nose/08.svg";
import Nose09 from "../../assets/face-parts/nose/09.svg";
import Nose10 from "../../assets/face-parts/nose/10.svg";
import Nose11 from "../../assets/face-parts/nose/11.svg";
import Nose12 from "../../assets/face-parts/nose/12.svg";

// Nose-eye
import NoseEye01 from "../../assets/face-parts/nose-eye/01.svg";
import NoseEye02 from "../../assets/face-parts/nose-eye/02.svg";
import NoseEye03 from "../../assets/face-parts/nose-eye/03.svg";
import NoseEye04 from "../../assets/face-parts/nose-eye/04.svg";
import NoseEye05 from "../../assets/face-parts/nose-eye/05.svg";
import NoseEye06 from "../../assets/face-parts/nose-eye/06.svg";

// Mouth
import Mouth01 from "../../assets/face-parts/mouth/01.svg";
import Mouth02 from "../../assets/face-parts/mouth/02.svg";
import Mouth03 from "../../assets/face-parts/mouth/03.svg";
import Mouth04 from "../../assets/face-parts/mouth/04.svg";
import Mouth05 from "../../assets/face-parts/mouth/05.svg";
import Mouth06 from "../../assets/face-parts/mouth/06.svg";
import Mouth07 from "../../assets/face-parts/mouth/07.svg";

export const eyeParts = [
	{
		name: "Eye01",
		Icon: Eye01,
		width: 2,
		height: 2,
	},
	{
		name: "Eye02",
		Icon: Eye02,
		width: 4,
		height: 2,
	},
	{
		name: "Eye03",
		Icon: Eye03,
		width: 3,
		height: 5,
	},
	{
		name: "Eye04",
		Icon: Eye04,
		width: 4,
		height: 6,
	},
	{
		name: "Eye05",
		Icon: Eye05,
		width: 4,
		height: 4,
	},
	{
		name: "Eye06",
		Icon: Eye06,
		width: 4,
		height: 4,
	},
] as const satisfies readonly FacePartDefinition[];

export const noseParts = [
	{
		name: "Nose01",
		Icon: Nose01,
		width: 7,
		height: 6,
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
		Icon: Nose02,
		width: 5,
		height: 6,
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
		Icon: Nose03,
		width: 4,
		height: 2,
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
		Icon: Nose04,
		width: 4,
		height: 4,
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
		Icon: Nose05,
		width: 5,
		height: 3,
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
		Icon: Nose06,
		width: 5,
		height: 5,
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
		Icon: Nose07,
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
		Icon: Nose08,
		width: 4,
		height: 7,
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
		Icon: Nose09,
		width: 4,
		height: 4,
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
		Icon: Nose10,
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
		Icon: Nose11,
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
		Icon: Nose12,
		width: 3,
		height: 3,
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
		Icon: NoseEye01,
		width: 7,
		height: 6,
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
		Icon: NoseEye02,
		width: 7,
		height: 6,
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
		Icon: NoseEye03,
		width: 7,
		height: 6,
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
		Icon: NoseEye04,
		width: 7,
		height: 6,
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
		Icon: NoseEye05,
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
		Icon: NoseEye06,
		width: 7,
		height: 7,
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
		Icon: Mouth01,
		width: 5,
		height: 5,
		boundX: 6,
		boundY: 6,
		boundW: 5,
		boundH: 5,
	},
	{
		name: "Mouth02",
		Icon: Mouth02,
		width: 7,
		height: 3,
		boundX: 1,
		boundY: 8,
		boundW: 9,
		boundH: 3,
	},
	{
		name: "Mouth03",
		Icon: Mouth03,
		width: 10,
		height: 5,
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
		Icon: Mouth04,
		width: 2,
		height: 2,
		boundX: 1,
		boundY: 9,
		boundW: 9,
		boundH: 2,
	},
	{
		name: "Mouth05",
		Icon: Mouth05,
		width: 5,
		height: 5,
		boundX: 0,
		boundY: 6,
		boundW: 5,
		boundH: 5,
	},
	{
		name: "Mouth06",
		Icon: Mouth06,
		width: 5,
		height: 1,
		boundX: 1,
		boundY: 9,
		boundW: 9,
		boundH: 2,
	},
	{
		name: "Mouth07",
		Icon: Mouth07,
		width: 4,
		height: 2,
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

const partLookup = new Map<FacePartName, FacePartDefinition>(
	[...eyeParts, ...noseParts, ...mouthParts].map(part => [part.name, part]),
);

export const getPartDefinition = (name: FacePartName): FacePartDefinition => {
	const part = partLookup.get(name);

	if (!part) {
		throw new Error(`Unknown face part: ${name}`);
	}

	return part;
};
