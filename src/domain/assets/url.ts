import { withImageKitTransformation } from "@humaan/payload-storage-imagekit/image";

export const getSiteUrl = () =>
	(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const getCanonicalAssetUrl = (path: string) => `${getSiteUrl()}${path}`;

export const withPngDelivery = (url: string) =>
	withImageKitTransformation(url, {
		format: "png",
	});
