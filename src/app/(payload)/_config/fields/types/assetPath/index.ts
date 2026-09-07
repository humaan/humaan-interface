import { formatAssetPath } from "./formatAssetPath";
import type { CollectionBeforeValidateHook, TextField } from "payload";

type AssetData = {
	id: string;
	filename?: string | null;
	mimeType?: string | null;
	path?: string | null;
};

export const assetPathField = (): TextField => ({
	name: "path",
	type: "text",
	label: "URL",
	required: true,
	index: true,
	unique: true,
	admin: {
		readOnly: true,
		position: "sidebar",
		components: {
			Field: {
				path: "@cms/fields/types/assetPath/AssetPathFieldComponent#AssetPathFieldComponent",
			},
		},
	},
});

export const setAssetPathFromFilename: CollectionBeforeValidateHook<AssetData> = ({
	data,
	originalDoc,
}) => {
	if (!data) return;

	const filename = data.filename || originalDoc?.filename;
	const mimeType = data.mimeType || originalDoc?.mimeType;
	if (filename) data.path = formatAssetPath(filename, mimeType);
};
