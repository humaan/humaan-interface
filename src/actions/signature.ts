"use server";

import { getCanonicalAssetUrl, getSiteUrl } from "@/domain/assets/url";
import { renderFaceSvg } from "@/domain/face/render";
import { parseFaceState } from "@/domain/face/validation";
import type { FaceLookupResult, GenerateSignatureResult } from "@/domain/signature/actions.types";
import { getLookupKeyAliases, normalizeLookupKey } from "@/domain/signature/lookup-key";
import {
	compileSignatureTemplate,
	getSignaturePlainText,
	wrapSignatureDocument,
} from "@/domain/signature/template";
import { isValidBasicAuthorization } from "@/lib/basic-auth";
import type { Asset, Person } from "@/payload-types";
import { formatAssetPath } from "@cms/fields/types/assetPath/formatAssetPath";
import config from "@payload-config";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { getPayload, type Payload } from "payload";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const parseRequiredText = (value: unknown, label: string) => {
	if (typeof value !== "string" || !value.trim()) {
		return { ok: false, error: `${label} is required.` } as const;
	}
	return { ok: true, value: value.trim() } as const;
};

const assertGeneratorAccess = async () => {
	const requestHeaders = await headers();
	if (!isValidBasicAuthorization(requestHeaders.get("authorization"))) {
		throw new Error("Authentication required.");
	}
};

const findAssignment = async (payload: Payload, key: string) => {
	const result = await payload.find({
		collection: "people",
		where: { key: { in: getLookupKeyAliases(key) } },
		limit: 2,
		depth: 1,
		overrideAccess: true,
	});
	return result.docs.find(doc => doc.key === key) ?? result.docs[0] ?? null;
};

const getAssignedAsset = (assignment: Person): Asset | null =>
	typeof assignment.faceAsset === "object" ? assignment.faceAsset : null;

const getAssetPath = (asset: Asset) => asset.path || null;

export const lookupFaceAssignment = async (value: string): Promise<FaceLookupResult> => {
	await assertGeneratorAccess();
	const key = normalizeLookupKey(value);
	if (!key) return { ok: false, error: "Email is required." };

	const payload = await getPayload({ config });
	const assignment = await findAssignment(payload, key);
	if (!assignment) return { ok: true, assignment: null };

	return {
		ok: true,
		assignment: {
			face: parseFaceState(assignment.faceState),
			name: assignment.name || "",
			position: assignment.position || "",
			updatedAt: assignment.updatedAt,
		},
	};
};

const createFaceAsset = async (payload: Payload, faceValue: unknown) => {
	const face = parseFaceState(faceValue);
	const svg = renderFaceSvg(face);
	const id = randomUUID();
	const filename = `face-${id}.svg`;
	const data = Buffer.from(svg, "utf8");
	const asset = await payload.create({
		collection: "assets",
		data: { path: formatAssetPath(filename, "image/svg+xml") },
		file: {
			data,
			name: filename,
			mimetype: "image/svg+xml",
			size: data.byteLength,
		},
		overrideAccess: true,
	});

	return { asset, face };
};

export const generateEmailSignature = async (input: unknown): Promise<GenerateSignatureResult> => {
	await assertGeneratorAccess();
	if (!isRecord(input)) return { ok: false, error: "Invalid signature details." };

	const key = normalizeLookupKey(input.key);
	const name = parseRequiredText(input.name, "Name");
	const position = parseRequiredText(input.position, "Position");

	if (!key) return { ok: false, error: "Email is required." };
	if (!name.ok) return { ok: false, error: name.error };
	if (!position.ok) return { ok: false, error: position.error };
	if (input.mode !== "saved" && input.mode !== "current") {
		return { ok: false, error: "Choose which face to use." };
	}

	const payload = await getPayload({ config });
	const assignment = await findAssignment(payload, key);
	let asset = assignment ? getAssignedAsset(assignment) : null;

	if (input.mode === "saved") {
		if (!assignment || !asset) return { ok: false, error: "No saved face was found." };
		await payload.update({
			collection: "people",
			id: assignment.id,
			data: { key, name: name.value, position: position.value },
			overrideAccess: true,
			depth: 1,
		});
	} else {
		if (!input.face) return { ok: false, error: "The current face is unavailable." };
		const created = await createFaceAsset(payload, input.face);
		asset = created.asset;

		if (assignment) {
			await payload.update({
				collection: "people",
				id: assignment.id,
				data: {
					key,
					name: name.value,
					position: position.value,
					faceAsset: asset.id,
					faceState: created.face as unknown as Record<string, unknown>,
				},
				overrideAccess: true,
				depth: 1,
			});
		} else {
			await payload.create({
				collection: "people",
				data: {
					key,
					name: name.value,
					position: position.value,
					faceAsset: asset.id,
					faceState: created.face as unknown as Record<string, unknown>,
				},
				overrideAccess: true,
				depth: 1,
			});
		}
	}

	const assetPath = getAssetPath(asset);
	if (!assetPath) throw new Error("The face asset has no canonical URL.");
	const faceUrl = getCanonicalAssetUrl(assetPath);
	const template = await payload.findGlobal({
		slug: "signature-template",
		overrideAccess: true,
	});
	const html = compileSignatureTemplate(template.html, {
		name: name.value,
		position: position.value,
		faceUrl,
		siteUrl: getSiteUrl(),
	});

	return {
		ok: true,
		html,
		plainText: getSignaturePlainText(html),
		documentHtml: wrapSignatureDocument(html),
		faceUrl,
		templateUpdatedAt: template.updatedAt ?? null,
	};
};
