"use client";

import { getCanonicalAssetUrl } from "@/domain/assets/url";
import { formatAssetPath } from "@cms/fields/types/assetPath/formatAssetPath";
import {
	BulkUploadProvider,
	CopyToClipboard,
	TextInput,
	UploadInput,
	useConfig,
	useField,
	usePayloadAPI,
} from "@payloadcms/ui";
import type { UploadFieldClientProps } from "payload";

const getDocumentID = (value: unknown) => {
	if (typeof value === "string" || typeof value === "number") return String(value);
	if (typeof value !== "object" || value === null || !("id" in value)) return "";

	const id = value.id;
	return typeof id === "string" || typeof id === "number" ? String(id) : "";
};

export const AssetPickerFieldComponent = ({
	field,
	path: pathFromProps,
	readOnly,
}: UploadFieldClientProps) => {
	const { config } = useConfig();
	const { disabled, filterOptions, path, setValue, showError, value } = useField<unknown>({
		potentiallyStalePath: pathFromProps,
	});
	const assetID = getDocumentID(value);
	const [{ data }] = usePayloadAPI(
		assetID ? `${config.routes.api}/assets/${encodeURIComponent(assetID)}?depth=0` : "",
	);
	const selectedAsset = assetID && String(data?.id) === assetID ? data : null;
	const assetPath =
		typeof selectedAsset?.path === "string"
			? selectedAsset.path
			: typeof selectedAsset?.filename === "string"
				? formatAssetPath(selectedAsset.filename, selectedAsset.mimeType)
				: "";
	const assetUrl = assetPath ? getCanonicalAssetUrl(assetPath) : "";

	return (
		<div className="field-type">
			<div className="render-fields">
				<BulkUploadProvider drawerSlugPrefix={pathFromProps}>
					<UploadInput
						allowCreate={field.admin?.allowCreate !== false}
						api={config.routes.api}
						className={field.admin?.className}
						description={field.admin?.description}
						displayPreview={field.displayPreview}
						filterOptions={filterOptions}
						label={field.label}
						localized={field.localized}
						onChange={nextValue => setValue(nextValue, true)}
						path={path}
						readOnly={readOnly || disabled}
						relationTo={field.relationTo}
						required={field.required}
						serverURL={config.serverURL}
						showError={showError}
						value={value as string}
					/>
				</BulkUploadProvider>
				<TextInput
					path={`${path}.url`}
					label="URL"
					value={assetUrl}
					readOnly
					AfterInput={
						assetUrl ? (
							<CopyToClipboard
								defaultMessage="Copy URL"
								value={assetUrl}
							/>
						) : undefined
					}
				/>
			</div>
		</div>
	);
};
