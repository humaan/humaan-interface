import { afterEach, describe, expect, it } from "vitest";
import { isBasicAuthEnabled, isValidBasicAuthorization } from "./basic-auth";

const originalUsername = process.env.HT_USER;
const originalPassword = process.env.HT_PASSWORD;

afterEach(() => {
	if (originalUsername === undefined) delete process.env.HT_USER;
	else process.env.HT_USER = originalUsername;
	if (originalPassword === undefined) delete process.env.HT_PASSWORD;
	else process.env.HT_PASSWORD = originalPassword;
});

describe("Basic Auth configuration", () => {
	it("allows public mode only when both credentials are absent", () => {
		delete process.env.HT_USER;
		delete process.env.HT_PASSWORD;

		expect(isBasicAuthEnabled()).toBe(false);
		expect(isValidBasicAuthorization(null)).toBe(true);
	});

	it("fails closed when only one credential is configured", () => {
		process.env.HT_USER = "humaan";
		delete process.env.HT_PASSWORD;

		expect(isBasicAuthEnabled()).toBe(true);
		expect(isValidBasicAuthorization(null)).toBe(false);
	});

	it("accepts the matching Basic authorization value", () => {
		process.env.HT_USER = "humaan";
		process.env.HT_PASSWORD = "secret";
		const authorization = `Basic ${Buffer.from("humaan:secret").toString("base64")}`;

		expect(isValidBasicAuthorization(authorization)).toBe(true);
		expect(isValidBasicAuthorization("Basic invalid")).toBe(false);
	});
});
