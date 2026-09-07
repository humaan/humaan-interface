import { DEFAULT_FACE } from "@/domain/face/model";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPayloadMock } = vi.hoisted(() => ({
	getPayloadMock: vi.fn(),
}));

vi.mock("payload", () => ({ getPayload: getPayloadMock }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/basic-auth", () => ({ isValidBasicAuthorization: () => true }));

import { generateEmailSignature, lookupFaceAssignment } from "./signature";

describe("signature actions", () => {
	beforeEach(() => {
		getPayloadMock.mockReset();
	});

	it("creates generated faces as standard Payload uploads", async () => {
		const create = vi.fn(async ({ collection, file }) => {
			if (collection === "assets") {
				return {
					id: "asset-id",
					filename: file.name,
					mimeType: file.mimetype,
					path: file.name.replace(/\.svg$/, ".png").replace(/^/, "/assets/"),
					createdAt: "2026-09-07T00:00:00.000Z",
					updatedAt: "2026-09-07T00:00:00.000Z",
				};
			}

			return { id: "assignment-id" };
		});
		getPayloadMock.mockResolvedValue({
			find: vi.fn().mockResolvedValue({ docs: [] }),
			create,
			update: vi.fn(),
			findGlobal: vi.fn().mockResolvedValue({
				html: "<p>{{name}} — {{position}} <img src=\"{{faceUrl}}\"></p>",
				updatedAt: "2026-09-07T00:00:00.000Z",
			}),
		});

		const result = await generateEmailSignature({
			key: "Person@humaan.com",
			name: "Person",
			position: "Designer",
			mode: "current",
			face: DEFAULT_FACE,
		});

		expect(result.ok).toBe(true);
		expect(create).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				collection: "assets",
				data: expect.objectContaining({
					path: expect.stringMatching(/^\/assets\/face-.+\.png$/),
				}),
				file: expect.objectContaining({
					name: expect.stringMatching(/^face-.+\.svg$/),
					mimetype: "image/svg+xml",
				}),
			}),
		);
		expect(create.mock.calls[0][0].data).toEqual({
			path: expect.stringMatching(/^\/assets\/face-.+\.png$/),
		});
		expect(create).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				collection: "people",
				data: expect.objectContaining({
					key: "person@humaan.com.au",
					name: "Person",
					position: "Designer",
					faceAsset: "asset-id",
				}),
			}),
		);
	});

	it("loads saved face state without requiring the related asset to populate", async () => {
		getPayloadMock.mockResolvedValue({
			find: vi.fn().mockResolvedValue({
				docs: [
					{
						id: "assignment-id",
						key: "person@humaan.com.au",
						name: "Person",
						position: "Designer",
						faceAsset: "legacy-asset-id",
						faceState: DEFAULT_FACE,
						createdAt: "2026-09-07T00:00:00.000Z",
						updatedAt: "2026-09-07T00:00:00.000Z",
					},
				],
			}),
		});

		await expect(lookupFaceAssignment("Person@humaan.com")).resolves.toEqual({
			ok: true,
			assignment: {
				face: DEFAULT_FACE,
				name: "Person",
				position: "Designer",
				updatedAt: "2026-09-07T00:00:00.000Z",
			},
		});
	});
});
