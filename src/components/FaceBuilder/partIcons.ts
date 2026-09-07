import type { ComponentType, SVGProps } from "react";
import Eye01 from "@/assets/face-parts/eyes/01.svg";
import Eye02 from "@/assets/face-parts/eyes/02.svg";
import Eye03 from "@/assets/face-parts/eyes/03.svg";
import Eye04 from "@/assets/face-parts/eyes/04.svg";
import Eye05 from "@/assets/face-parts/eyes/05.svg";
import Eye06 from "@/assets/face-parts/eyes/06.svg";
import Mouth01 from "@/assets/face-parts/mouth/01.svg";
import Mouth02 from "@/assets/face-parts/mouth/02.svg";
import Mouth03 from "@/assets/face-parts/mouth/03.svg";
import Mouth04 from "@/assets/face-parts/mouth/04.svg";
import Mouth05 from "@/assets/face-parts/mouth/05.svg";
import Mouth06 from "@/assets/face-parts/mouth/06.svg";
import Mouth07 from "@/assets/face-parts/mouth/07.svg";
import NoseEye01 from "@/assets/face-parts/nose-eye/01.svg";
import NoseEye02 from "@/assets/face-parts/nose-eye/02.svg";
import NoseEye03 from "@/assets/face-parts/nose-eye/03.svg";
import NoseEye04 from "@/assets/face-parts/nose-eye/04.svg";
import NoseEye05 from "@/assets/face-parts/nose-eye/05.svg";
import NoseEye06 from "@/assets/face-parts/nose-eye/06.svg";
import Nose01 from "@/assets/face-parts/nose/01.svg";
import Nose02 from "@/assets/face-parts/nose/02.svg";
import Nose03 from "@/assets/face-parts/nose/03.svg";
import Nose04 from "@/assets/face-parts/nose/04.svg";
import Nose05 from "@/assets/face-parts/nose/05.svg";
import Nose06 from "@/assets/face-parts/nose/06.svg";
import Nose07 from "@/assets/face-parts/nose/07.svg";
import Nose08 from "@/assets/face-parts/nose/08.svg";
import Nose09 from "@/assets/face-parts/nose/09.svg";
import Nose10 from "@/assets/face-parts/nose/10.svg";
import Nose11 from "@/assets/face-parts/nose/11.svg";
import Nose12 from "@/assets/face-parts/nose/12.svg";
import type { FacePartName } from "@/domain/face/parts";

type PartIcon = ComponentType<SVGProps<SVGSVGElement>>;

const partIcons: Record<FacePartName, PartIcon> = {
	Eye01,
	Eye02,
	Eye03,
	Eye04,
	Eye05,
	Eye06,
	Mouth01,
	Mouth02,
	Mouth03,
	Mouth04,
	Mouth05,
	Mouth06,
	Mouth07,
	NoseEye01,
	NoseEye02,
	NoseEye03,
	NoseEye04,
	NoseEye05,
	NoseEye06,
	Nose01,
	Nose02,
	Nose03,
	Nose04,
	Nose05,
	Nose06,
	Nose07,
	Nose08,
	Nose09,
	Nose10,
	Nose11,
	Nose12,
};

export const getPartIcon = (name: FacePartName) => partIcons[name];
