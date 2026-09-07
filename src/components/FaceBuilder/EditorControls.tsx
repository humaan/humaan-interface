import type { CSSProperties } from "react";
import {
	FACE_COLORS,
	type ColorPlane,
	type FaceColor,
	type FacePartKey,
	type FaceState,
} from "@/domain/face/model";
import {
	eyeParts,
	mouthParts,
	noseParts,
	type FacePartDefinition,
	type FacePartName,
} from "@/domain/face/parts";
import { CheckIcon, FlipIcon } from "./Icons";
import styles from "./FaceBuilder.module.scss";

type EditorControlsProps = {
	face: FaceState;
	onSelectColor: (plane: ColorPlane, color: FaceColor) => void;
	onSelectPart: (key: FacePartKey, name: FacePartName | null) => void;
	onFlipPart: (key: FacePartKey, axis: "x" | "y") => void;
};

const colorNames: Record<FaceColor, string> = {
	"#643A87": "Purple",
	"#FFCA38": "Yellow",
	"#FBD0D1": "Pink",
	"#99DAF4": "Blue",
	"#F15744": "Orange",
	"#DECFE6": "Lilac",
};

const partLabels: Record<FacePartKey, string> = {
	eye1: "Left eye",
	eye2: "Right eye",
	nose: "Nose",
	mouth: "Mouth",
};

const getPartOptionLabel = (definition: FacePartDefinition, index: number) =>
	definition.name.startsWith("NoseEye")
		? `Combined nose and eye ${Number.parseInt(definition.name.replace("NoseEye", ""), 10)}`
		: `${definition.name.replace(/\d+$/, "")} option ${index + 1}`;

const ColorPicker = ({
	label,
	plane,
	face,
	onSelect,
}: {
	label: string;
	plane: ColorPlane;
	face: FaceState;
	onSelect: EditorControlsProps["onSelectColor"];
}) => {
	const otherPlane = plane === "background" ? "foreground" : "background";

	return (
		<fieldset className={styles["color-picker"]}>
			<legend className={styles["control-label"]}>{label}</legend>
			<div className={styles["color-picker__options"]}>
				{FACE_COLORS.map(color => {
					const selected = face[plane] === color;
					const willSwap = face[otherPlane] === color;

					return (
						<button
							key={color}
							type="button"
							className={styles["color-picker__option"]}
							style={{ "--swatch": color } as CSSProperties}
							aria-label={`${colorNames[color]}${willSwap ? "; swap with the other colour" : ""}`}
							aria-pressed={selected}
							data-selected={selected || undefined}
							data-swap={willSwap || undefined}
							onClick={() => onSelect(plane, color)}
						>
							{selected && <CheckIcon />}
							{willSwap && !selected && <span aria-hidden="true">↔</span>}
						</button>
					);
				})}
			</div>
		</fieldset>
	);
};

const PartPicker = ({
	partKey,
	parts,
	face,
	onSelect,
	onFlip,
	allowFlipY = false,
}: {
	partKey: FacePartKey;
	parts: readonly FacePartDefinition[];
	face: FaceState;
	onSelect: EditorControlsProps["onSelectPart"];
	onFlip: EditorControlsProps["onFlipPart"];
	allowFlipY?: boolean;
}) => {
	const placement = face.parts[partKey];

	return (
		<fieldset className={styles["part-picker"]}>
			<legend className={styles["sr-only"]}>{partLabels[partKey]}</legend>
			<div className={styles["part-picker__heading"]}>
				<span
					className={styles["control-label"]}
					aria-hidden="true"
				>
					{partLabels[partKey]}
				</span>
				<div className={styles["part-picker__actions"]}>
					<button
						type="button"
						className={styles["flip-button"]}
						aria-label={`Flip ${partLabels[partKey]} horizontally`}
						aria-pressed={placement?.flipX ?? false}
						disabled={!placement}
						onClick={() => onFlip(partKey, "x")}
					>
						<FlipIcon />
					</button>
					{allowFlipY && (
						<button
							type="button"
							className={styles["flip-button"]}
							aria-label={`Flip ${partLabels[partKey]} vertically`}
							aria-pressed={placement?.flipY ?? false}
							disabled={!placement}
							onClick={() => onFlip(partKey, "y")}
						>
							<FlipIcon className={styles["flip-button__vertical-icon"]} />
						</button>
					)}
				</div>
			</div>

			<div className={styles["part-picker__options"]}>
				<button
					type="button"
					className={styles["part-picker__option"]}
					aria-label={`Remove ${partLabels[partKey]}`}
					aria-pressed={!placement}
					data-selected={!placement || undefined}
					onClick={() => onSelect(partKey, null)}
				>
					<span className={styles["part-picker__none"]} />
				</button>

				{parts.map((part, index) => {
					const { Icon } = part;
					const selected = placement?.name === part.name;

					return (
						<button
							key={part.name}
							type="button"
							className={styles["part-picker__option"]}
							aria-label={getPartOptionLabel(part, index)}
							aria-pressed={selected}
							data-selected={selected || undefined}
							onClick={() => onSelect(partKey, part.name as FacePartName)}
						>
							<span
								className={styles["part-picker__icon"]}
								style={{
									transform: `scale(${placement?.flipX ? -1 : 1}, ${placement?.flipY ? -1 : 1})`,
								}}
							>
								<Icon
									aria-hidden="true"
									focusable="false"
								/>
							</span>
							{selected && (
								<span className={styles["part-picker__check"]}>
									<CheckIcon />
								</span>
							)}
						</button>
					);
				})}
			</div>
		</fieldset>
	);
};

export const EditorControls = ({
	face,
	onSelectColor,
	onSelectPart,
	onFlipPart,
}: EditorControlsProps) => (
	<div className={styles["editor-controls"]}>
		<section
			className={styles["control-section"]}
			aria-labelledby="colours-heading"
		>
			<div className={styles["control-section__intro"]}>
				<h2 id="colours-heading">Colours</h2>
				<p>Selecting a colour already in use swaps the pair.</p>
			</div>
			<div className={styles["color-controls"]}>
				<ColorPicker
					label="Face"
					plane="background"
					face={face}
					onSelect={onSelectColor}
				/>
				<ColorPicker
					label="Features"
					plane="foreground"
					face={face}
					onSelect={onSelectColor}
				/>
			</div>
		</section>

		<section
			className={styles["control-section"]}
			aria-labelledby="features-heading"
		>
			<div className={styles["control-section__intro"]}>
				<h2 id="features-heading">Features</h2>
				<p>Pick a shape, flip it, then drag it into place on the face.</p>
			</div>
			<PartPicker
				partKey="eye1"
				parts={eyeParts}
				face={face}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
			/>
			<PartPicker
				partKey="eye2"
				parts={eyeParts}
				face={face}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
			/>
			<PartPicker
				partKey="nose"
				parts={noseParts}
				face={face}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
			/>
			<PartPicker
				partKey="mouth"
				parts={mouthParts}
				face={face}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
				allowFlipY
			/>
		</section>
	</div>
);
