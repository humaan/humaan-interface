import type { FaceState } from "./model";
import { CANVAS_SIZE, FACE_PADDING, type FacePartKey } from "./model";
import { getPartDefinition } from "./parts";
import { facePartSvgSources } from "./svgParts.generated";

const partRenderOrder = ["mouth", "nose", "eye1", "eye2"] as const satisfies readonly FacePartKey[];

const renderPart = (face: FaceState, key: FacePartKey) => {
	const placement = face.parts[key];
	if (!placement) return "";

	const definition = getPartDefinition(placement.name);
	const source = facePartSvgSources[placement.name];
	const translateX = placement.x + (placement.flipX ? definition.width : 0);
	const translateY = placement.y + (placement.flipY ? definition.height : 0);
	const transform = `translate(${translateX} ${translateY}) scale(${placement.flipX ? -1 : 1} ${placement.flipY ? -1 : 1})`;

	return `<g transform="${transform}" color="${face.foreground}"><svg width="${definition.width}" height="${definition.height}" viewBox="${source.viewBox}" aria-hidden="true" focusable="false">${source.content}</svg></g>`;
};

export const renderFaceSvg = (face: FaceState) => {
	const parts = partRenderOrder.map(key => renderPart(face, key)).join("");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" width="680" height="680"><rect width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" rx="0.5" fill="${face.background}"/><g transform="translate(${FACE_PADDING} ${FACE_PADDING})">${parts}</g></svg>`;
};
