import { describe, expect, it } from "vitest";
import {
	formatAssetPath,
	getAssetDeliveryFilename,
} from "./formatAssetPath";

describe("asset public paths", () => {
	it("derives PNG delivery filenames for SVG masters", () => {
		expect(getAssetDeliveryFilename("face.svg", "image/svg+xml")).toBe("face.png");
		expect(formatAssetPath("face.svg", "image/svg+xml")).toBe("/assets/face.png");
	});

	it("preserves raster filenames and encodes canonical paths", () => {
		expect(formatAssetPath("Humaan face.png")).toBe("/assets/Humaan%20face.png");
	});
});
