import config from "@payload-config";
import { DEFAULT_SIGNATURE_TEMPLATE } from "@/domain/signature/template";
import { formatAssetPath } from "@cms/fields/types/assetPath/formatAssetPath";
import { getPayload } from "payload";

const sourceAssets = [
	{
		filename: "humaanemail.png",
		url: "https://humaan.com/assets/email/humaanemail.png",
	},
	{
		filename: "ISO27001Certified.png",
		url: "https://humaan.com/assets/email/ISO27001Certified.png",
	},
	{
		filename: "awards2026.png",
		url: "https://humaan.com/assets/email/awards2026.png",
	},
] as const;

const payload = await getPayload({ config });

try {
	payload.logger.info("Clearing existing content…");
	// Use Payload for current uploads so storage-adapter deletion hooks run before
	// the database collections are discarded.
	await payload.delete({
		collection: "assets",
		where: { id: { exists: true } },
		overrideAccess: true,
	});

	const database = payload.db.connection.db;
	if (!database) throw new Error("MongoDB is not connected.");

	const usersCollectionName = payload.db.collections.users.collection.collectionName;
	const collections = await database.listCollections({}, { nameOnly: true }).toArray();
	await Promise.all(
		collections
			.filter(collection => collection.name !== usersCollectionName)
			.map(collection => database.dropCollection(collection.name)),
	);

	await payload.updateGlobal({
		slug: "signature-template",
		data: {
			html: DEFAULT_SIGNATURE_TEMPLATE,
		},
		overrideAccess: true,
	});

	for (const source of sourceAssets) {
		const response = await fetch(source.url);
		if (!response.ok) {
			throw new Error(`Could not download ${source.url}: ${response.status}`);
		}

		const data = Buffer.from(await response.arrayBuffer());
		const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/png";
		await payload.create({
			collection: "assets",
			data: { path: formatAssetPath(source.filename, mimeType) },
			file: {
				data,
				name: source.filename,
				mimetype: mimeType,
				size: data.byteLength,
			},
			overrideAccess: true,
		});
		payload.logger.info(`Created asset: ${source.filename}`);
	}
} finally {
	await payload.destroy();
}
