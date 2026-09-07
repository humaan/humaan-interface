export const SIGNATURE_TOKENS = ["{{name}}", "{{position}}", "{{faceUrl}}"] as const;

export const DEFAULT_SIGNATURE_TEMPLATE = `<table cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td valign="top" style="padding: 0">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" style="padding: 0">
            <img width="60" height="60" src="{{faceUrl}}" alt="" style="margin: 0; padding: 0; border: none; display: block; max-width: 60px; max-height: 60px" />
          </td>
          <td valign="top" style="padding: 0 0 0 17px">
            <p style="margin: 0 0 4px; font-size: 13px; color: #6b6b6b; font-family: Helvetica Neue, Helvetica, Arial, sans-serif">
              <strong style="margin-right: 6px; color: #222222">{{name}}</strong>
            </p>
            <p style="margin: 0 0 4px; font-size: 13px; color: #6b6b6b; font-family: Helvetica Neue, Helvetica, Arial, sans-serif">
              <span>{{position}}</span>
            </p>
            <p style="margin: 0 0 4px; font-size: 12px; color: #222222; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif">
              <span style="display: inline-block; margin-right: 6px"><strong>P</strong> <span>+61 8 9471 7645</span></span>
              <span style="display: inline-block"><strong>W</strong> <a href="https://humaan.com" style="color: #222222; text-decoration: underline">humaan.com</a></span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td height="11" style="font-size: 11px; line-height: 11px"></td></tr>
  <tr>
    <td valign="top">
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="font-size: 1px; line-height: 1px" border="0" bgcolor="#9A9A9A"></td></tr></table>
    </td>
  </tr>
  <tr><td height="11" style="font-size: 11px; line-height: 11px"></td></tr>
  <tr>
    <td><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="top" width="330" style="vertical-align: middle;"><img width="330" height="20" src="/assets/humaanemail.png" alt="Humaan" style="margin: 0; padding: 0; border: none; display: block; max-width: 330px; max-height: 20px" /></td></tr></table></td>
  </tr>
  <tr><td height="16" style="font-size: 16px; line-height: 16px"></td></tr>
  <tr>
    <td valign="top" width="330" style="vertical-align: middle; padding-top: 1px"><a href="https://www.humaan.com/security" target="_blank"><img width="330" height="33" src="/assets/ISO27001Certified.png" alt="ISO 27001:2022 Certified" title="ISO 27001:2022 Certified" style="margin: 0; padding: 0; border: none; display: block; max-width: 330px; max-height: 33px" /></a></td>
  </tr>
  <tr><td height="8" style="font-size: 8px; line-height: 8px"></td></tr>
  <tr>
    <td valign="top" width="330" style="vertical-align: middle; padding-top: 1px"><a href="https://www.humaan.com/thinking/global-recognition-for-two-humaan-projects" target="_blank"><img width="330" height="94" src="/assets/awards2026.png" alt="Humaan awards and recognition" style="margin: 0; padding: 0; border: none; display: block; max-width: 330px; max-height: 94px" /></a></td>
  </tr>
  <tr><td height="26" style="font-size: 26px; line-height: 26px"></td></tr>
</table>`;

type SignatureTemplateValues = {
	name: string;
	position: string;
	faceUrl: string;
	siteUrl: string;
};

const escapeHtml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");

export const validateSignatureTemplate = (value: unknown): true | string => {
	if (typeof value !== "string" || value.trim().length === 0) {
		return "Signature HTML is required.";
	}

	const missingTokens = SIGNATURE_TOKENS.filter(token => !value.includes(token));
	return missingTokens.length === 0
		? true
		: `Signature HTML is missing: ${missingTokens.join(", ")}`;
};

export const compileSignatureTemplate = (
	template: string,
	{ name, position, faceUrl, siteUrl }: SignatureTemplateValues,
) => {
	const canonicalSiteUrl = siteUrl.replace(/\/+$/, "");

	return template
		.replaceAll("{{name}}", escapeHtml(name))
		.replaceAll("{{position}}", escapeHtml(position))
		.replaceAll("{{faceUrl}}", escapeHtml(faceUrl))
		.replace(/\b(src)=(['"])\/assets\//gi, `$1=$2${canonicalSiteUrl}/assets/`);
};

export const wrapSignatureDocument = (signatureHtml: string) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Humaan email signature</title></head>
<body style="padding: 0; margin: 0">${signatureHtml}</body>
</html>`;

export const getSignaturePlainText = (signatureHtml: string) =>
	signatureHtml
		.replace(/<\/(p|tr|table)>/gi, "\n")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&#039;", "'")
		.replace(/[^\S\r\n]+/g, " ")
		.replace(/ *\n */g, "\n")
		.replace(/\n{2,}/g, "\n")
		.trim();
