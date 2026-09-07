import type { CSSProperties } from "react";
import {
	FACE_COLORS,
	type ColorPlane,
	type FaceColor,
	type FacePartKey,
	type FacePartLocks,
	type FaceState,
} from "@/domain/face/model";
import {
	eyeParts,
	mouthParts,
	noseParts,
	type FacePartDefinition,
	type FacePartName,
} from "@/domain/face/parts";
import { CheckIcon, FlipIcon, LockIcon } from "./Icons";
import { getPartIcon } from "./partIcons";
import styles from "./FaceBuilder.module.scss";

type EditorControlsProps = {
	face: FaceState;
	locks: FacePartLocks;
	onSelectColor: (plane: ColorPlane, color: FaceColor) => void;
	onSelectPart: (key: FacePartKey, name: FacePartName | null) => void;
	onFlipPart: (key: FacePartKey, axis: "x" | "y") => void;
	onToggleLock: (key: FacePartKey) => void;
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
							{selected && <CheckIcon className={styles["selection-check"]} />}
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
	locked,
	onSelect,
	onFlip,
	onToggleLock,
	allowFlipY = false,
}: {
	partKey: FacePartKey;
	parts: readonly FacePartDefinition<FacePartName>[];
	face: FaceState;
	locked: boolean;
	onSelect: EditorControlsProps["onSelectPart"];
	onFlip: EditorControlsProps["onFlipPart"];
	onToggleLock: EditorControlsProps["onToggleLock"];
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
						className={styles["part-action-button"]}
						aria-label={`${locked ? "Unlock" : "Lock"} ${partLabels[partKey]} during randomise`}
						aria-pressed={locked}
						data-active={locked || undefined}
						onClick={() => onToggleLock(partKey)}
					>
						<LockIcon locked={locked} />
					</button>
					<button
						type="button"
						className={styles["part-action-button"]}
						aria-label={`Flip ${partLabels[partKey]} horizontally`}
						onClick={() => onFlip(partKey, "x")}
					>
						<FlipIcon />
					</button>
					{allowFlipY && (
						<button
							type="button"
							className={styles["part-action-button"]}
							aria-label={`Flip ${partLabels[partKey]} vertically`}
							onClick={() => onFlip(partKey, "y")}
						>
							<FlipIcon className={styles["part-action-button__vertical-icon"]} />
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
				/>

				{parts.map((part, index) => {
					const Icon = getPartIcon(part.name);
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
								style={
									{
										"--part-width": part.width,
										"--part-height": part.height,
										transform: `scale(${placement?.flipX ? -1 : 1}, ${placement?.flipY ? -1 : 1})`,
									} as CSSProperties
								}
							>
								<Icon
									aria-hidden="true"
									focusable="false"
								/>
							</span>
							{selected && (
								<CheckIcon
									className={`${styles["selection-check"]} ${styles["selection-check--part"]}`}
								/>
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
	locks,
	onSelectColor,
	onSelectPart,
	onFlipPart,
	onToggleLock,
}: EditorControlsProps) => (
	<div className={styles["editor-controls"]}>
		<section
			className={styles["control-section"]}
			aria-labelledby="colours-heading"
		>
			<h2 id="colours-heading">Colours</h2>
			<div className={styles["color-controls"]}>
				<ColorPicker
					label="Background"
					plane="background"
					face={face}
					onSelect={onSelectColor}
				/>
				<ColorPicker
					label="Face"
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
			<h2 id="features-heading">Features</h2>
			<PartPicker
				partKey="eye1"
				parts={eyeParts}
				face={face}
				locked={locks.eye1}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
				onToggleLock={onToggleLock}
			/>
			<PartPicker
				partKey="eye2"
				parts={eyeParts}
				face={face}
				locked={locks.eye2}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
				onToggleLock={onToggleLock}
			/>
			<PartPicker
				partKey="nose"
				parts={noseParts}
				face={face}
				locked={locks.nose}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
				onToggleLock={onToggleLock}
			/>
			<PartPicker
				partKey="mouth"
				parts={mouthParts}
				face={face}
				locked={locks.mouth}
				onSelect={onSelectPart}
				onFlip={onFlipPart}
				onToggleLock={onToggleLock}
				allowFlipY
			/>
		</section>
	</div>
);
