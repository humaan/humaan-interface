import { Assets } from "@cms/collections/Assets";
import { People } from "@cms/collections/People";
import { Users } from "@cms/collections/Users";
import { SignatureTemplate } from "@cms/globals/SignatureTemplate";
import { imageKitStoragePluginConfig } from "@cms/payload-config/imageKitStoragePluginConfig";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const collections = [People, Assets, Users];

export default buildConfig({
	serverURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: dirname,
		},
		autoLogin:
			process.env.NODE_ENV === "development" &&
			process.env.PAYLOAD_DEV_EMAIL &&
			process.env.PAYLOAD_DEV_PASSWORD
				? {
						email: process.env.PAYLOAD_DEV_EMAIL,
						password: process.env.PAYLOAD_DEV_PASSWORD,
						prefillOnly: true,
					}
				: false,
	},
	collections,
	globals: [SignatureTemplate],
	secret: process.env.PAYLOAD_SECRET || "",
	typescript: {
		outputFile: path.resolve(dirname, "../../../payload-types.ts"),
	},
	db: mongooseAdapter({
		url: process.env.DATABASE_URI || "",
	}),
	cors: process.env.CORS_ALLOWED?.split(",").filter(Boolean) || [],
	csrf: process.env.CSRF_ALLOWED?.split(",").filter(Boolean) || [],
	plugins: [imageKitStoragePluginConfig],
});
