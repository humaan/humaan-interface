const getConfiguredCredentials = () => {
	const username = process.env.HT_USER;
	const password = process.env.HT_PASSWORD;
	return username || password ? { username, password } : null;
};

export const isBasicAuthEnabled = () => getConfiguredCredentials() !== null;

export const isValidBasicAuthorization = (authorization: string | null) => {
	const credentials = getConfiguredCredentials();
	if (!credentials) return true;
	if (!credentials.username || !credentials.password) return false;

	const expected = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`;
	return authorization === expected;
};
