import { isAdmin } from "@cms/access/isAdmin";
import { AdminNavGroups } from "@cms/collections/constants";
import { parseFaceState } from "@/domain/face/validation";
import { normalizeLookupKey } from "@/domain/signature/lookup-key";
import type { CollectionConfig, FieldHook } from "payload";

const normalizeAssignmentKey: FieldHook = ({ value }) => normalizeLookupKey(value);

export const People: CollectionConfig = {
	slug: "people",
	labels: {
		singular: "Person",
		plural: "People",
	},
	access: {
		read: isAdmin,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	admin: {
		group: AdminNavGroups.Email,
		useAsTitle: "key",
		defaultColumns: ["key", "name", "position", "faceAsset", "updatedAt"],
	},
	versions: {
		drafts: false,
		maxPerDoc: 50,
	},
	fields: [
		{
			name: "key",
			label: "Email",
			type: "text",
			required: true,
			unique: true,
			index: true,
			hooks: {
				beforeValidate: [normalizeAssignmentKey],
			},
			validate: (value: unknown) =>
				typeof value === "string" && value.trim() ? true : "Email is required.",
		},
		{
			name: "name",
			type: "text",
			required: true,
		},
		{
			name: "position",
			type: "text",
			required: true,
		},
		{
			name: "faceAsset",
			label: "Face",
			type: "relationship",
			relationTo: "assets",
			required: true,
		},
		{
			name: "faceState",
			type: "json",
			required: true,
			admin: {
				hidden: true,
			},
			validate: (value: unknown) => {
				try {
					parseFaceState(value);
					return true;
				} catch (error) {
					return error instanceof Error ? error.message : "Invalid face state.";
				}
			},
		},
	],
};
