"use client";

import type { KeyboardEvent, PointerEvent, Ref } from "react";
import { useRef, useState } from "react";
import {
	CANVAS_SIZE,
	FACE_PADDING,
	GRID_DIVISIONS,
	POSITION_STEP,
	type FacePartKey,
	type FaceState,
} from "@/domain/face/model";
import { getPartDefinition } from "@/domain/face/parts";
import styles from "./FaceBuilder.module.scss";

type FaceCanvasProps = {
	face: FaceState;
	interactive?: boolean;
	onMovePart?: (key: FacePartKey, position: { x: number; y: number }) => void;
	onRemovePart?: (key: FacePartKey) => void;
	svgRef?: Ref<SVGSVGElement>;
	className?: string;
};

type DragState = {
	key: FacePartKey;
	pointerId: number;
	startClientX: number;
	startClientY: number;
	startX: number;
	startY: number;
};

const partLabels: Record<FacePartKey, string> = {
	eye1: "left eye",
	eye2: "right eye",
	nose: "nose",
	mouth: "mouth",
};

const partRenderOrder: FacePartKey[] = ["mouth", "nose", "eye1", "eye2"];

export const FaceCanvas = ({
	face,
	interactive = false,
	onMovePart,
	onRemovePart,
	svgRef,
	className,
}: FaceCanvasProps) => {
	const dragState = useRef<DragState | null>(null);
	const [draggingPart, setDraggingPart] = useState<FacePartKey | null>(null);

	const beginDrag = (event: PointerEvent<SVGGElement>, key: FacePartKey) => {
		if (!interactive || event.button !== 0) return;

		const placement = face.parts[key];
		if (!placement) return;

		event.currentTarget.setPointerCapture(event.pointerId);
		dragState.current = {
			key,
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			startX: placement.x,
			startY: placement.y,
		};
		setDraggingPart(key);
	};

	const continueDrag = (event: PointerEvent<SVGGElement>) => {
		const drag = dragState.current;
		const svg = event.currentTarget.ownerSVGElement;

		if (!drag || !svg || drag.pointerId !== event.pointerId) return;

		const bounds = svg.getBoundingClientRect();
		const deltaX = ((event.clientX - drag.startClientX) / bounds.width) * CANVAS_SIZE;
		const deltaY = ((event.clientY - drag.startClientY) / bounds.height) * CANVAS_SIZE;

		onMovePart?.(drag.key, {
			x: drag.startX + deltaX,
			y: drag.startY + deltaY,
		});
	};

	const endDrag = (event: PointerEvent<SVGGElement>) => {
		if (dragState.current?.pointerId !== event.pointerId) return;

		dragState.current = null;
		setDraggingPart(null);
	};

	const handleKeyDown = (event: KeyboardEvent<SVGGElement>, key: FacePartKey) => {
		if (!interactive) return;

		const placement = face.parts[key];
		if (!placement) return;

		const distance = event.shiftKey ? 1 : POSITION_STEP;
		const changes: Record<string, { x: number; y: number }> = {
			ArrowLeft: { x: placement.x - distance, y: placement.y },
			ArrowRight: { x: placement.x + distance, y: placement.y },
			ArrowUp: { x: placement.x, y: placement.y - distance },
			ArrowDown: { x: placement.x, y: placement.y + distance },
		};

		if (changes[event.key]) {
			event.preventDefault();
			onMovePart?.(key, changes[event.key]);
		}

		if (event.key === "Delete" || event.key === "Backspace") {
			event.preventDefault();
			onRemovePart?.(key);
		}
	};

	return (
		<svg
			ref={svgRef}
			className={className}
			viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
			role={interactive ? "group" : undefined}
			aria-label={interactive ? "Custom Humaan face. Drag a feature to reposition it." : undefined}
			aria-hidden={interactive ? undefined : true}
			focusable="false"
		>
			{interactive && <title>Custom Humaan face</title>}
			<rect
				id="face-background"
				width={CANVAS_SIZE}
				height={CANVAS_SIZE}
				rx="0.5"
				fill={face.background}
			/>

			<g transform={`translate(${FACE_PADDING} ${FACE_PADDING})`}>
				{draggingPart && (
					<g
						className={styles["face-canvas__grid"]}
						data-editor-only="true"
					>
						{Array.from({ length: GRID_DIVISIONS - 1 }, (_, index) => index + 1).map(line => (
							<g key={line}>
								<line
									x1={line}
									y1="0"
									x2={line}
									y2={GRID_DIVISIONS}
								/>
								<line
									x1="0"
									y1={line}
									x2={GRID_DIVISIONS}
									y2={line}
								/>
							</g>
						))}
					</g>
				)}

				{partRenderOrder.map(key => {
					const placement = face.parts[key];
					if (!placement) return null;

					const definition = getPartDefinition(placement.name);
					const { Icon } = definition;
					const translateX = placement.x + (placement.flipX ? definition.width : 0);
					const translateY = placement.y + (placement.flipY ? definition.height : 0);
					const transform = `translate(${translateX} ${translateY}) scale(${placement.flipX ? -1 : 1} ${placement.flipY ? -1 : 1})`;

					return (
						<g
							key={key}
							className={interactive ? styles["face-canvas__part"] : undefined}
							transform={transform}
							color={face.foreground}
							data-face-part={key}
							tabIndex={interactive ? 0 : undefined}
							role={interactive ? "button" : undefined}
							aria-label={
								interactive
									? `${partLabels[key]}. Drag or use arrow keys to move; press Delete to remove.`
									: undefined
							}
							onPointerDown={event => beginDrag(event, key)}
							onPointerMove={continueDrag}
							onPointerUp={endDrag}
							onPointerCancel={endDrag}
							onKeyDown={event => handleKeyDown(event, key)}
						>
							<Icon
								width={definition.width}
								height={definition.height}
								aria-hidden="true"
								focusable="false"
							/>
							{interactive && (
								<rect
									className={styles["face-canvas__part-outline"]}
									data-editor-only="true"
									width={definition.width}
									height={definition.height}
									rx="0.12"
									fill="transparent"
									vectorEffect="non-scaling-stroke"
								/>
							)}
						</g>
					);
				})}
			</g>
		</svg>
	);
};
