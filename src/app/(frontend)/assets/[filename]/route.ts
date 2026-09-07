import { formatAssetPath } from "@cms/fields/types/assetPath/formatAssetPath";
import { withPngDelivery } from "@/domain/assets/url";
import type { Asset } from "@/payload-types";
import config from "@payload-config";
import { notFound } from "next/navigation";
import { getPayload } from "payload";

type RouteArgs = {
	params: Promise<{ filename: string }>;
};

const getUpstreamUrl = (asset: Asset) => asset.imagekit?.url || asset.url;

export const GET = async (_request: Request, { params }: RouteArgs) => {
	const [{ filename }, payload] = await Promise.all([params, getPayload({ config })]);
	const result = await payload.find({
		collection: "assets",
		where: { path: { equals: formatAssetPath(filename) } },
		limit: 1,
		depth: 0,
		overrideAccess: true,
	});
	const asset = result.docs[0];
	const sourceUrl = asset ? getUpstreamUrl(asset) : null;

	if (!asset || !sourceUrl) notFound();

	const deliveryUrl =
		asset.mimeType === "image/svg+xml" ? withPngDelivery(sourceUrl) : sourceUrl;
	const upstream = await fetch(deliveryUrl, {
		headers: { "Accept-Encoding": "identity" },
	});

	if (!upstream.ok || !upstream.body) notFound();

	const responseHeaders = new Headers();
	responseHeaders.set(
		"Cache-Control",
		"public, max-age=31536000, s-maxage=31536000, immutable",
	);
	responseHeaders.set(
		"Content-Type",
		upstream.headers.get("content-type") || asset.mimeType || "application/octet-stream",
	);
	const etag = upstream.headers.get("etag");
	if (etag) responseHeaders.set("ETag", etag);

	return new Response(upstream.body, {
		status: 200,
		headers: responseHeaders,
	});
};
