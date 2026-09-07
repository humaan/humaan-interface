"use client";

import {
	compileSignatureTemplate,
	DEFAULT_SIGNATURE_TEMPLATE,
	wrapSignatureDocument,
} from "@/domain/signature/template";
import { FieldLabel, useFormFields } from "@payloadcms/ui";

const sampleFaceUrl = "https://humaan.com/assets/email/email-face-sam.png";

export const SignatureTemplatePreview = () => {
	const html = useFormFields(([fields]) => fields.html?.value);
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	const template = typeof html === "string" ? html : DEFAULT_SIGNATURE_TEMPLATE;
	const preview = compileSignatureTemplate(template, {
		name: "Jay Hollywood",
		position: "Founder & CEO",
		faceUrl: sampleFaceUrl,
		siteUrl,
	});

	return (
		<div className="field-type">
			<FieldLabel label="Preview" />
			<div className="field-type__wrap">
				<iframe
					title="Email signature preview"
					sandbox=""
					srcDoc={wrapSignatureDocument(preview)}
					style={{
						width: "100%",
						minHeight: "340px",
						border: 0,
						background: "white",
						display: "block",
					}}
				/>
			</div>
		</div>
	);
};
