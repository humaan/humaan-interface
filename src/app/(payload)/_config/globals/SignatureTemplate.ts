import { isAdmin } from "@cms/access/isAdmin";
import { AdminNavGroups } from "@cms/collections/constants";
import { assetPickerField } from "@cms/fields/types/assetPicker";
import { DEFAULT_SIGNATURE_TEMPLATE, validateSignatureTemplate } from "@/domain/signature/template";
import type { GlobalConfig } from "payload";

export const SignatureTemplate: GlobalConfig = {
	slug: "signature-template",
	label: "Template",
	access: {
		read: isAdmin,
		update: isAdmin,
	},
	admin: {
		group: AdminNavGroups.Email,
	},
	versions: {
		drafts: false,
		max: 20,
	},
	fields: [
		{
			name: "html",
			label: "Signature HTML",
			type: "code",
			required: true,
			defaultValue: DEFAULT_SIGNATURE_TEMPLATE,
			validate: validateSignatureTemplate,
			admin: {
				description:
					"Inline-styled HTML fragment. Required tokens: {{name}}, {{position}}, and {{faceUrl}}. Saving changes the live template immediately.",
				language: "html",
			},
		},

		{
			type: "group",
			label: "",
			admin: {
				hideGutter: true,
				position: "sidebar",
			},
			fields: [
				assetPickerField(),
				{
					name: "preview",
					type: "ui",
					admin: {
						components: {
							Field: {
								path: "@cms/components/SignatureTemplatePreview/SignatureTemplatePreview#SignatureTemplatePreview",
							},
						},
					},
				},
			],
		},
	],
};
