const getExtension = (filename: string) => {
	const lastDot = filename.lastIndexOf(".");
	return lastDot > 0 && lastDot < filename.length - 1
		? filename.slice(lastDot + 1).toLowerCase()
		: null;
};

const withoutExtension = (filename: string) => {
	const extension = getExtension(filename);
	return extension ? filename.slice(0, -(extension.length + 1)) : filename;
};

export const getAssetDeliveryFilename = (
	filename: string,
	mimeType: string | null | undefined,
) =>
	mimeType === "image/svg+xml" || getExtension(filename) === "svg"
		? `${withoutExtension(filename)}.png`
		: filename;

export const formatAssetPath = (filename: string, mimeType?: string | null) =>
	`/assets/${encodeURIComponent(getAssetDeliveryFilename(filename, mimeType))}`;
