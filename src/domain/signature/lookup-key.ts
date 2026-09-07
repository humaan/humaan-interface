const canonicalDomain = "@humaan.com.au";
const alternateDomain = "@humaan.com";

export const normalizeLookupKey = (value: unknown) => {
	if (typeof value !== "string") return "";

	const normalized = value.trim().toLowerCase();
	return normalized.endsWith(alternateDomain)
		? `${normalized.slice(0, -alternateDomain.length)}${canonicalDomain}`
		: normalized;
};

export const getLookupKeyAliases = (value: unknown) => {
	const canonical = normalizeLookupKey(value);
	if (!canonical.endsWith(canonicalDomain)) return canonical ? [canonical] : [];

	return [canonical, `${canonical.slice(0, -canonicalDomain.length)}${alternateDomain}`];
};
