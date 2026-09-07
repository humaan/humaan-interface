"use client";

import { getCanonicalAssetUrl } from "@/domain/assets/url";
import { CopyToClipboard, TextInput, useField } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";

const PathInput = ({ field, path, value }: TextFieldClientProps & { value: string }) => {
	const url = value ? getCanonicalAssetUrl(value) : "";

	return (
		<TextInput
			path={path || field.name}
			label={field.label}
			value={url}
			readOnly
			AfterInput={
				url ? (
					<CopyToClipboard
						defaultMessage="Copy URL"
						value={url}
					/>
				) : undefined
			}
		/>
	);
};

export const AssetPathFieldComponent = (props: TextFieldClientProps) => {
	const { value } = useField<string>({ path: props.path });
	return (
		<PathInput
			{...props}
			value={value || ""}
		/>
	);
};
