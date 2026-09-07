"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, domMax, LazyMotion, m, MotionConfig } from "motion/react";
import {
	centreFaceParts,
	DEFAULT_FACE,
	DEFAULT_FACE_PART_LOCKS,
	moveFacePart,
	randomiseFace,
	selectFacePart,
	setFaceColor,
	togglePartFlip,
	type ColorPlane,
	type FaceColor,
	type FacePartKey,
	type FacePartLocks,
	type FaceState,
} from "@/domain/face/model";
import type { FacePartName } from "@/domain/face/parts";
import { LoadFaceDialog } from "@/components/LoadFaceDialog/LoadFaceDialog";
import { SignatureDialog } from "@/components/SignatureDialog/SignatureDialog";
import { EditorControls } from "./EditorControls";
import { FaceCanvas } from "./FaceCanvas";
import { CentreIcon, DownloadIcon, EmailIcon, HumaanLogo, LoadIcon, ShuffleIcon } from "./Icons";
import styles from "./FaceBuilder.module.scss";

type HistoryItem = {
	id: number;
	face: FaceState;
};

const removeEditorMarkup = (svg: SVGSVGElement) => {
	svg.querySelectorAll("[data-editor-only]").forEach(element => element.remove());

	[svg, ...svg.querySelectorAll("*")].forEach(element => {
		element.removeAttribute("class");
		element.removeAttribute("tabindex");
		element.removeAttribute("role");
		element.removeAttribute("aria-label");
		element.removeAttribute("aria-hidden");
		element.removeAttribute("focusable");

		Array.from(element.attributes).forEach(attribute => {
			if (attribute.name.startsWith("data-")) {
				element.removeAttribute(attribute.name);
			}
		});
	});
};

const serializeFace = (source: SVGSVGElement) => {
	const clone = source.cloneNode(true) as SVGSVGElement;
	removeEditorMarkup(clone);
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	clone.setAttribute("width", "680");
	clone.setAttribute("height", "680");

	return new XMLSerializer().serializeToString(clone);
};

const getLuminance = (color: string) => {
	const hex = color.slice(1);
	const channels = [0, 2, 4].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255);

	return channels
		.map(channel => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
		.reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
};

const getReadableColor = (background: FaceColor) => {
	const backgroundLuminance = getLuminance(background);
	const dark = "#27242a";
	const contrastWithDark = (backgroundLuminance + 0.05) / (getLuminance(dark) + 0.05);
	const contrastWithWhite = 1.05 / (backgroundLuminance + 0.05);

	return contrastWithDark > contrastWithWhite ? dark : "#ffffff";
};

export const FaceBuilder = () => {
	const [face, setFace] = useState<FaceState>(DEFAULT_FACE);
	const [locks, setLocks] = useState<FacePartLocks>(DEFAULT_FACE_PART_LOCKS);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [animation, setAnimation] = useState<"jiggle" | "jump">("jiggle");
	const [animationKey, setAnimationKey] = useState(0);
	const [announcement, setAnnouncement] = useState("");
	const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
	const [loadDialogOpen, setLoadDialogOpen] = useState(false);
	const nextHistoryId = useRef(0);
	const faceSvgRef = useRef<SVGSVGElement>(null);

	const addToHistory = (previousFace: FaceState) => {
		const item = { id: nextHistoryId.current++, face: previousFace };
		setHistory(current => [item, ...current].slice(0, 5));
	};

	const replayAnimation = (nextAnimation: "jiggle" | "jump") => {
		setAnimation(nextAnimation);
		setAnimationKey(current => current + 1);
	};

	const handleRandomise = () => {
		addToHistory(face);
		setFace(current => randomiseFace(current, locks));
		replayAnimation("jiggle");
		setAnnouncement("A new face was generated.");
	};

	const handleRestore = (item: HistoryItem) => {
		const currentFace = face;
		const currentFaceHistoryItem = { id: nextHistoryId.current++, face: currentFace };
		setHistory(current =>
			[currentFaceHistoryItem, ...current.filter(historyItem => historyItem.id !== item.id)].slice(
				0,
				5,
			),
		);
		setFace(item.face);
		replayAnimation("jump");
		setAnnouncement("Previous face restored.");
	};

	const handleDownload = () => {
		if (!faceSvgRef.current) return;

		const svg = `<?xml version="1.0" encoding="UTF-8"?>\n${serializeFace(faceSvgRef.current)}`;
		const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
		const link = document.createElement("a");

		link.href = url;
		link.download = "humaan-face.svg";
		link.hidden = true;
		document.body.appendChild(link);
		link.click();
		window.setTimeout(() => {
			link.remove();
			URL.revokeObjectURL(url);
		}, 0);
		setAnnouncement("SVG downloaded.");
	};

	const handleCentre = () => {
		setFace(current => centreFaceParts(current));
		replayAnimation("jump");
		setAnnouncement("Face features centred.");
	};

	const handleLoadFace = (loadedFace: FaceState) => {
		addToHistory(face);
		setFace(loadedFace);
		replayAnimation("jump");
		setAnnouncement("Saved face loaded.");
	};

	useEffect(() => {
		if (!faceSvgRef.current) return;

		const favicon =
			document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement("link");
		favicon.rel = "icon";
		favicon.href = `data:image/svg+xml,${encodeURIComponent(serializeFace(faceSvgRef.current))}`;

		if (!favicon.parentNode) {
			document.head.appendChild(favicon);
		}
	}, [face]);

	const customProperties = {
		"--workspace-background": face.foreground,
		"--workspace-foreground": getReadableColor(face.foreground),
		"--face-background": face.background,
		"--face-foreground": face.foreground,
	} as CSSProperties;

	return (
		<div
			className={styles["face-builder"]}
			style={customProperties}
		>
			<header className={styles["face-builder__header"]}>
				<a
					className={styles["brand"]}
					href="https://humaan.com"
					aria-label="Humaan home"
				>
					<HumaanLogo />
				</a>
				<h1>Humaan Interface</h1>
				<p className={styles["face-builder__byline"]}>Mix and match until you find your humaan.</p>
			</header>

			<aside
				className={styles["face-builder__panel"]}
				aria-label="Face controls"
			>
				<EditorControls
					face={face}
					locks={locks}
					onSelectColor={(plane: ColorPlane, color: FaceColor) =>
						setFace(current => setFaceColor(current, plane, color))
					}
					onSelectPart={(key: FacePartKey, name: FacePartName | null) =>
						setFace(current => selectFacePart(current, key, name))
					}
					onFlipPart={(key: FacePartKey, axis: "x" | "y") =>
						setFace(current => togglePartFlip(current, key, axis))
					}
					onToggleLock={(key: FacePartKey) =>
						setLocks(current => ({ ...current, [key]: !current[key] }))
					}
				/>
			</aside>

			<main className={styles["face-builder__workspace"]}>
				<div className={styles["workspace__inner"]}>
					<div
						key={animationKey}
						className={`${styles["face-frame"]} ${styles[`face-frame--${animation}`]}`}
					>
						<FaceCanvas
							face={face}
							interactive
							svgRef={faceSvgRef}
							className={styles["face-canvas"]}
							onMovePart={(key, position) =>
								setFace(current => moveFacePart(current, key, position))
							}
							onRemovePart={key => setFace(current => selectFacePart(current, key, null))}
						/>
					</div>

					<div
						className={styles["history"]}
						data-empty={history.length === 0 || undefined}
					>
						<p>Previous faces</p>
						<LazyMotion
							features={domMax}
							strict
						>
							<MotionConfig reducedMotion="user">
								<div className={styles["history__items"]}>
									<AnimatePresence
										initial={false}
										mode="popLayout"
									>
										{history.map((item, index) => (
											<m.button
												layout="position"
												key={item.id}
												type="button"
												className={styles["history__item"]}
												aria-label={`Restore previous face ${index + 1}`}
												initial={{ opacity: 0, scale: 0.82, x: -12 }}
												animate={{ opacity: 1 - index * 0.1, scale: 1, x: 0 }}
												exit={{ opacity: 0, scale: 0.78 }}
												transition={{
													layout: { type: "spring", bounce: 0.16, duration: 0.48 },
													opacity: { duration: 0.16 },
													scale: { duration: 0.16 },
												}}
												whileHover={{ y: -3, scale: 1.03 }}
												whileFocus={{ y: -3, scale: 1.03 }}
												onClick={() => handleRestore(item)}
											>
												<FaceCanvas
													face={item.face}
													className={styles["face-canvas"]}
												/>
											</m.button>
										))}
									</AnimatePresence>
								</div>
							</MotionConfig>
						</LazyMotion>
					</div>
				</div>

				<div className={styles["action-bar"]}>
					<button
						type="button"
						className={`${styles["action-button"]} ${styles["action-button--primary"]}`}
						onClick={handleRandomise}
					>
						<ShuffleIcon />
						<span>Randomise</span>
					</button>

					<div className={styles["utility-actions"]}>
						<button
							type="button"
							className={styles["action-button"]}
							onClick={() => setLoadDialogOpen(true)}
						>
							<LoadIcon />
							<span className={styles["action-button__label--desktop"]}>Load saved face</span>
							<span className={styles["action-button__label--mobile"]}>Load</span>
						</button>
						<button
							type="button"
							className={styles["action-button"]}
							onClick={handleCentre}
						>
							<CentreIcon />
							<span className={styles["action-button__label--desktop"]}>Centre features</span>
							<span className={styles["action-button__label--mobile"]}>Centre</span>
						</button>
						<div className={styles["export-actions"]}>
							<button
								type="button"
								className={styles["action-button"]}
								aria-label="Export face as SVG"
								onClick={handleDownload}
							>
								<DownloadIcon />
								<span className={styles["action-button__label--desktop"]}>Export SVG</span>
								<span className={styles["action-button__label--mobile"]}>SVG</span>
							</button>
							<button
								type="button"
								className={styles["action-button"]}
								aria-label="Generate email signature"
								onClick={() => setSignatureDialogOpen(true)}
							>
								<EmailIcon />
								<span className={styles["action-button__label--desktop"]}>Email signature</span>
								<span className={styles["action-button__label--mobile"]}>Email</span>
							</button>
						</div>
					</div>
				</div>
				<p
					className={styles["sr-only"]}
					aria-live="polite"
				>
					{announcement}
				</p>
			</main>
			<SignatureDialog
				face={face}
				open={signatureDialogOpen}
				onClose={() => setSignatureDialogOpen(false)}
			/>
			<LoadFaceDialog
				open={loadDialogOpen}
				onClose={() => setLoadDialogOpen(false)}
				onLoad={handleLoadFace}
			/>
		</div>
	);
};
