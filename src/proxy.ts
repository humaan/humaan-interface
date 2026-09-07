import { isBasicAuthEnabled, isValidBasicAuthorization } from "@/lib/basic-auth";
import type { NextRequest, ProxyConfig } from "next/server";

export const config: ProxyConfig = {
	matcher: ["/((?!api|assets|_next/static|_next/image|.well-known|favicon|icon).*)"],
};

export function proxy(request: NextRequest) {
	if (
		isBasicAuthEnabled() &&
		!isValidBasicAuthorization(request.headers.get("authorization"))
	) {
		return new Response("Authentication required.", {
			status: 401,
			headers: {
				"WWW-Authenticate": 'Basic realm="Humaan Interface", charset="UTF-8"',
			},
		});
	}
}
