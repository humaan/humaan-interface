import { payloadStorageImageKit } from "@humaan/payload-storage-imagekit";

export const imageKitStoragePluginConfig = payloadStorageImageKit({
	collections: {
		assets: true,
	},
	urlEndpoint: process.env.IMAGEKIT_ENDPOINT || "",
	publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
	folder: process.env.IMAGEKIT_ROOT_FOLDER || "",
	clientUploads: true,
});
