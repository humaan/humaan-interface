import { describe, expect, it } from "vitest";
import { DEFAULT_FACE } from "./model";
import { renderFaceSvg } from "./render";
import { facePartSvgSources } from "./svgParts.generated";

describe("renderFaceSvg", () => {
	it("renders a deterministic standalone SVG from face state", () => {
		const svg = renderFaceSvg(DEFAULT_FACE);

		expect(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(svg).toContain('width="680" height="680"');
		expect(svg).toContain(`fill="${DEFAULT_FACE.background}"`);
		expect(svg).toContain(`color="${DEFAULT_FACE.foreground}"`);
		expect(svg).toContain('fill="currentColor"');
		expect(svg).not.toContain("data-editor-only");
	});

	it("renders every face part using the selected foreground colour", () => {
		for (const source of Object.values(facePartSvgSources)) {
			expect(source.content).toContain('fill="currentColor"');
		}
	});
});
