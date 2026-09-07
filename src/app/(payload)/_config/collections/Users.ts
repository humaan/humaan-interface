import { isAdmin } from "@cms/access/isAdmin";
import { AdminNavGroups } from "@cms/collections/constants";
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
	slug: "users",
	auth: true,
	admin: {
		group: AdminNavGroups.Admin,
		useAsTitle: "email",
	},
	access: {
		read: isAdmin,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
		unlock: isAdmin,
	},
	fields: [],
};
