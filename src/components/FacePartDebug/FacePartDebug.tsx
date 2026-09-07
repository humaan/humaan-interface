import Link from "next/link";
import { createElement, type SVGProps } from "react";
import {
	getFacePartCollisionZones,
	getFacePartFallbackPosition,
	getFacePartPlacementBounds,
	getFacePartSlots,
	GRID_DIVISIONS,
	POSITION_STEP,
	type FacePartKey,
	type PartPlacement,
} from "@/domain/face/model";
import {
	eyeParts,
	mouthParts,
	noseParts,
	type Bounds,
	type FacePartDefinition,
	type FacePartName,
} from "@/domain/face/parts";
import { getPartIcon } from "@/components/FaceBuilder/partIcons";
import styles from "./FacePartDebug.module.scss";

type PartGroup = {
	id: string;
	label: string;
	partType: "eye" | "nose" | "mouth";
	parts: readonly FacePartDefinition<FacePartName>[];
};

const groups: readonly PartGroup[] = [
	{
		id: "eyes",
		label: "Eyes",
		partType: "eye",
		parts: eyeParts,
	},
	{
		id: "noses",
		label: "Noses",
		partType: "nose",
		parts: noseParts.filter(
			part => part.name.startsWith("Nose") && !part.name.startsWith("NoseEye"),
		),
	},
	{
		id: "nose-eyes",
		label: "Nose + eyes",
		partType: "nose",
		parts: noseParts.filter(part => part.name.startsWith("NoseEye")),
	},
	{
		id: "mouths",
		label: "Mouths",
		partType: "mouth",
		parts: mouthParts,
	},
];

const allParts = groups.flatMap(group => group.parts);

const PartIcon = ({ name, ...props }: SVGProps<SVGSVGElement> & { name: FacePartName }) =>
	createElement(getPartIcon(name), props);

const formatNumber = (value: number) =>
	Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/0+$/, "");

const formatBounds = ({ x, y, width, height }: Bounds) =>
	`x ${formatNumber(x)} · y ${formatNumber(y)} · w ${formatNumber(width)} · h ${formatNumber(height)}`;

const getPlacementBounds = (definition: FacePartDefinition<FacePartName>): Bounds | null => {
	if (
		definition.boundX === undefined ||
		definition.boundY === undefined ||
		definition.boundW === undefined ||
		definition.boundH === undefined
	) {
		return null;
	}

	return {
		x: definition.boundX,
		y: definition.boundY,
		width: definition.boundW,
		height: definition.boundH,
	};
};

const getEffectiveCollisionZones = (definition: FacePartDefinition<FacePartName>): Bounds[] => {
	return getFacePartCollisionZones({
		name: definition.name,
		x: 0,
		y: 0,
		flipX: false,
		flipY: false,
	});
};

const getPlotBounds = (definition: FacePartDefinition<FacePartName>): Bounds => {
	const geometry = [
		{ x: 0, y: 0, width: definition.width, height: definition.height },
		...(definition.slots ?? []),
		...getEffectiveCollisionZones(definition),
	];
	const left = Math.min(...geometry.map(bounds => bounds.x));
	const top = Math.min(...geometry.map(bounds => bounds.y));
	const right = Math.max(...geometry.map(bounds => bounds.x + bounds.width));
	const bottom = Math.max(...geometry.map(bounds => bounds.y + bounds.height));
	const padding = 1;

	return {
		x: left - padding,
		y: top - padding,
		width: right - left + padding * 2,
		height: bottom - top + padding * 2,
	};
};

type FaceContext = {
	key: FacePartKey;
	bounds: Bounds;
	placement: PartPlacement;
	collisionZones: Bounds[];
	slots: Bounds[];
};

const getFaceContexts = (
	definition: FacePartDefinition<FacePartName>,
	partType: PartGroup["partType"],
): FaceContext[] => {
	const keys: FacePartKey[] = partType === "eye" ? ["eye1", "eye2"] : [partType];

	return keys.map(key => {
		const bounds = getFacePartPlacementBounds(key, definition);
		const position = getFacePartFallbackPosition(key, definition);
		const placement: PartPlacement = {
			name: definition.name,
			...position,
			flipX: false,
			flipY: false,
		};

		return {
			key,
			bounds,
			placement,
			collisionZones: getFacePartCollisionZones(placement),
			slots: getFacePartSlots(placement),
		};
	});
};

const PartVisualLayers = ({
	definition,
	placement,
	slots,
	collisionZones,
	variant,
	showSlotLabels = false,
}: {
	definition: FacePartDefinition<FacePartName>;
	placement: PartPlacement;
	slots: readonly Bounds[];
	collisionZones: readonly Bounds[];
	variant: "geometry" | "placement";
	showSlotLabels?: boolean;
}) => {
	const classNames = {
		artwork: styles[`${variant}__artwork`],
		collision: styles[`${variant}__collision`],
		dimensions: styles[`${variant}__dimensions`],
		origin: styles[`${variant}__origin`],
		slot: styles[`${variant}__slot`],
	};
	const originSize = variant === "geometry" ? 0.35 : 0.3;

	return (
		<>
			{slots.map((slot, index) => (
				<g key={`slot-${slot.x}-${slot.y}-${slot.width}-${slot.height}`}>
					<rect
						{...slot}
						className={classNames.slot}
						vectorEffect="non-scaling-stroke"
					/>
					{showSlotLabels && (
						<text
							x={slot.x + 0.35}
							y={slot.y + 0.9}
							className={styles["geometry__slot-label"]}
						>
							S{index + 1}
						</text>
					)}
				</g>
			))}
			<PartIcon
				name={definition.name}
				x={placement.x}
				y={placement.y}
				width={definition.width}
				height={definition.height}
				className={classNames.artwork}
				aria-hidden="true"
				focusable="false"
			/>
			<rect
				x={placement.x}
				y={placement.y}
				width={definition.width}
				height={definition.height}
				className={classNames.dimensions}
				vectorEffect="non-scaling-stroke"
			/>
			{collisionZones.map(zone => (
				<rect
					key={`collision-${zone.x}-${zone.y}-${zone.width}-${zone.height}`}
					{...zone}
					className={classNames.collision}
					vectorEffect="non-scaling-stroke"
				/>
			))}
			<g
				className={classNames.origin}
				transform={`translate(${placement.x} ${placement.y})`}
			>
				<line
					x1={-originSize}
					y1="0"
					x2={originSize}
					y2="0"
					vectorEffect="non-scaling-stroke"
				/>
				<line
					x1="0"
					y1={-originSize}
					x2="0"
					y2={originSize}
					vectorEffect="non-scaling-stroke"
				/>
			</g>
		</>
	);
};

const PartGeometry = ({ definition }: { definition: FacePartDefinition<FacePartName> }) => {
	const plot = getPlotBounds(definition);
	const effectiveZones = getEffectiveCollisionZones(definition);
	const placement: PartPlacement = {
		name: definition.name,
		x: 0,
		y: 0,
		flipX: false,
		flipY: false,
	};
	const gridId = `local-grid-${definition.name.toLowerCase()}`;

	return (
		<figure className={styles["geometry"]}>
			<figcaption>Local geometry</figcaption>
			<svg
				className={styles["geometry__svg"]}
				viewBox={`${plot.x} ${plot.y} ${plot.width} ${plot.height}`}
				role="img"
				aria-label={`${definition.name} local geometry, collision zones, and slots`}
			>
				<defs>
					<pattern
						id={gridId}
						width="1"
						height="1"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 1 0 L 0 0 0 1"
							className={styles["geometry__grid-line"]}
						/>
					</pattern>
				</defs>
				<rect
					x={plot.x}
					y={plot.y}
					width={plot.width}
					height={plot.height}
					fill={`url(#${gridId})`}
				/>

				<PartVisualLayers
					definition={definition}
					placement={placement}
					slots={definition.slots ?? []}
					collisionZones={effectiveZones}
					variant="geometry"
					showSlotLabels
				/>
			</svg>
		</figure>
	);
};

const FaceContextGeometry = ({
	definition,
	partType,
}: {
	definition: FacePartDefinition<FacePartName>;
	partType: PartGroup["partType"];
}) => {
	const contexts = getFaceContexts(definition, partType);
	const gridId = `placement-grid-${definition.name.toLowerCase()}`;
	const clipId = `placement-clip-${definition.name.toLowerCase()}`;

	return (
		<figure className={styles["placement"]}>
			<figcaption>
				Face context
				{partType === "eye" && <span>Eye fallbacks</span>}
			</figcaption>
			<svg
				viewBox={`-0.5 -0.5 ${GRID_DIVISIONS + 1} ${GRID_DIVISIONS + 1}`}
				role="img"
				aria-label={`${definition.name} metadata translated onto the face grid`}
			>
				<defs>
					<pattern
						id={gridId}
						width="1"
						height="1"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 1 0 L 0 0 0 1"
							className={styles["placement__grid-line"]}
						/>
					</pattern>
					<clipPath id={clipId}>
						<rect
							width={GRID_DIVISIONS}
							height={GRID_DIVISIONS}
						/>
					</clipPath>
				</defs>
				<rect
					width={GRID_DIVISIONS}
					height={GRID_DIVISIONS}
					className={styles["placement__face"]}
				/>
				<rect
					width={GRID_DIVISIONS}
					height={GRID_DIVISIONS}
					fill={`url(#${gridId})`}
				/>
				<g clipPath={`url(#${clipId})`}>
					{contexts.map(context => (
						<rect
							key={`bounds-${context.key}`}
							{...context.bounds}
							className={styles["placement__bounds"]}
							vectorEffect="non-scaling-stroke"
						/>
					))}
					{contexts.map(context => (
						<PartVisualLayers
							key={`context-${context.key}`}
							definition={definition}
							placement={context.placement}
							slots={context.slots}
							collisionZones={context.collisionZones}
							variant="placement"
						/>
					))}
				</g>
			</svg>
		</figure>
	);
};

const BoundsList = ({ bounds }: { bounds: readonly Bounds[] }) => (
	<ul className={styles["bounds-list"]}>
		{bounds.map((item, index) => (
			<li key={`${item.x}-${item.y}-${item.width}-${item.height}`}>
				<span>{index + 1}</span>
				<code>{formatBounds(item)}</code>
			</li>
		))}
	</ul>
);

const PartCard = ({
	definition,
	partType,
}: {
	definition: FacePartDefinition<FacePartName>;
	partType: PartGroup["partType"];
}) => {
	const placementBounds = getPlacementBounds(definition);
	const fallbackBounds = getFaceContexts(definition, partType).map(context => context.bounds);
	const collisionZones = definition.collisionZones ?? [
		{ x: 0, y: 0, width: definition.width, height: definition.height },
	];

	return (
		<article
			className={styles["part-card"]}
			id={definition.name.toLowerCase()}
		>
			<header className={styles["part-card__header"]}>
				<h3>{definition.name}</h3>
				<code>
					{formatNumber(definition.width)} × {formatNumber(definition.height)}
				</code>
			</header>

			<div className={styles["part-card__visuals"]}>
				<PartGeometry definition={definition} />
				<FaceContextGeometry
					definition={definition}
					partType={partType}
				/>
			</div>

			<dl className={styles["metadata"]}>
				<div>
					<dt>Dimensions</dt>
					<dd>
						<code>
							w {formatNumber(definition.width)} · h {formatNumber(definition.height)}
						</code>
					</dd>
				</div>
				<div>
					<dt>Placement bounds</dt>
					<dd>
						{placementBounds ? (
							<code>{formatBounds(placementBounds)}</code>
						) : (
							<>
								<span className={styles["metadata__default"]}>Host slot / eye fallbacks</span>
								<BoundsList bounds={fallbackBounds} />
							</>
						)}
					</dd>
				</div>
				<div>
					<dt>Collision zones</dt>
					<dd>
						{!definition.collisionZones && (
							<span className={styles["metadata__default"]}>Full-part default</span>
						)}
						<BoundsList bounds={collisionZones} />
					</dd>
				</div>
				<div>
					<dt>Eye slots</dt>
					<dd>
						{definition.slots ? (
							<BoundsList bounds={definition.slots} />
						) : (
							<span className={styles["metadata__default"]}>None</span>
						)}
					</dd>
				</div>
				<div>
					<dt>Direction-aware X flip</dt>
					<dd>
						<code>{definition.directionAwareFlipX ?? "off"}</code>
					</dd>
				</div>
				<div>
					<dt>Skip nose</dt>
					<dd>
						<code>{definition.skipNose ? "true" : "false"}</code>
					</dd>
				</div>
			</dl>
		</article>
	);
};

export const FacePartDebug = () => (
	<main className={styles["debug-page"]}>
		<header className={styles["page-header"]}>
			<div className={styles["toolbar"]}>
				<h1 className={styles["sr-only"]}>Face parts debug</h1>
				<Link href="/">← Face builder</Link>
				<code>{allParts.length} parts</code>
			</div>

			<div
				className={styles["legend"]}
				aria-label="Visualization legend"
			>
				<span>
					<i data-swatch="artwork" />
					Artwork
				</span>
				<span>
					<i data-swatch="dimensions" />
					Dimensions
				</span>
				<span>
					<i data-swatch="collision" />
					Collision (+{formatNumber(POSITION_STEP / 2)})
				</span>
				<span>
					<i data-swatch="slot" />
					Eye slot
				</span>
				<span>
					<i data-swatch="bounds" />
					Placement bounds
				</span>
				<span>
					<i data-swatch="origin" />
					Local origin
				</span>
			</div>
		</header>

		<nav
			className={styles["section-nav"]}
			aria-label="Face part groups"
		>
			{groups.map(group => (
				<a
					key={group.id}
					href={`#${group.id}`}
				>
					{group.label}
					<sup>{group.parts.length}</sup>
				</a>
			))}
		</nav>

		{groups.map(group => (
			<section
				className={styles["part-group"]}
				id={group.id}
				key={group.id}
			>
				<header className={styles["part-group__header"]}>
					<h2>{group.label}</h2>
					<span>{group.parts.length}</span>
				</header>
				<div className={styles["part-grid"]}>
					{group.parts.map(definition => (
						<PartCard
							key={definition.name}
							definition={definition}
							partType={group.partType}
						/>
					))}
				</div>
			</section>
		))}
	</main>
);
