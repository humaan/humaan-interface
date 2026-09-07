import { isAdmin } from "@cms/access/isAdmin";
import { AdminNavGroups } from "@cms/collections/constants";
import { assetPathField, setAssetPathFromFilename } from "@cms/fields/types/assetPath";
import type { CollectionConfig } from "payload";

export const Assets: CollectionConfig = {
	slug: "assets",
	access: {
		read: isAdmin,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	admin: {
		group: AdminNavGroups.Email,
		defaultColumns: ["filename", "path", "updatedAt"],
	},
	custom: {
		prependPath: "/assets",
	},
	hooks: {
		beforeValidate: [setAssetPathFromFilename],
	},
	fields: [assetPathField()],
	upload: {
		mimeTypes: ["image/*"],
	},
};
