import { describe, expect, it } from "vitest";
import {
	compileSignatureTemplate,
	DEFAULT_SIGNATURE_TEMPLATE,
	validateSignatureTemplate,
	wrapSignatureDocument,
} from "./template";

describe("signature templates", () => {
	it("requires every supported token", () => {
		expect(validateSignatureTemplate(DEFAULT_SIGNATURE_TEMPLATE)).toBe(true);
		expect(validateSignatureTemplate("{{name}} {{position}}")).toContain("{{faceUrl}}");
		expect(DEFAULT_SIGNATURE_TEMPLATE).toContain(
			'<tr><td height="16" style="font-size: 16px; line-height: 16px"></td></tr>',
		);
		expect(DEFAULT_SIGNATURE_TEMPLATE).not.toContain("/assets/email/");
	});

	it("escapes employee values and makes asset URLs canonical", () => {
		const html = compileSignatureTemplate(DEFAULT_SIGNATURE_TEMPLATE, {
			name: "Sam <Admin>",
			position: 'Lead "Developer"',
			faceUrl: "https://interface.humaan.com/assets/face-1.png",
			siteUrl: "https://interface.humaan.com/",
		});

		expect(html).toContain("Sam &lt;Admin&gt;");
		expect(html).toContain("Lead &quot;Developer&quot;");
		expect(html).toContain('src="https://interface.humaan.com/assets/humaanemail.png"');
		expect(html).not.toContain("{{name}}");
	});

	it("wraps fragments as downloadable HTML documents", () => {
		expect(wrapSignatureDocument("<table></table>")).toContain(
			'<body style="padding: 0; margin: 0"><table></table></body>',
		);
	});
});
