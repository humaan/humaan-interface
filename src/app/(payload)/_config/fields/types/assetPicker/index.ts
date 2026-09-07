import type { UploadField } from "payload";

export const assetPickerField = (): UploadField => ({
	name: "assetPicker",
	label: "Pick an asset to copy its URL",
	type: "upload",
	relationTo: "assets",
	virtual: true,
	admin: {
		readOnly: false,
		components: {
			Field: {
				path: "@cms/fields/types/assetPicker/AssetPickerFieldComponent#AssetPickerFieldComponent",
			},
		},
	},
});
