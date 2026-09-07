"use client";

import {
	generateEmailSignature,
	lookupFaceAssignment,
} from "@/actions/signature";
import { FaceCanvas } from "@/components/FaceBuilder/FaceCanvas";
import type { FaceState } from "@/domain/face/model";
import type {
	FaceLookupResult,
	GenerateSignatureResult,
} from "@/domain/signature/actions.types";
import { normalizeLookupKey } from "@/domain/signature/lookup-key";
import { useEffect, useRef, useState, useTransition } from "react";
import styles from "./SignatureDialog.module.scss";

type SignatureDialogProps = {
	face: FaceState;
	open: boolean;
	onClose: () => void;
};

type SavedAssignment = Extract<FaceLookupResult, { ok: true }>["assignment"];
type GeneratedSignature = Extract<GenerateSignatureResult, { ok: true }>;

const copyRenderedHtmlFallback = (html: string) => {
	const container = document.createElement("div");
	container.contentEditable = "true";
	container.innerHTML = html;
	container.style.position = "fixed";
	container.style.left = "-10000px";
	container.style.top = "0";
	document.body.appendChild(container);

	const selection = window.getSelection();
	const range = document.createRange();
	range.selectNodeContents(container);
	selection?.removeAllRanges();
	selection?.addRange(range);
	const copied = document.execCommand("copy");
	selection?.removeAllRanges();
	container.remove();

	if (!copied) throw new Error("Copy failed.");
};

const copySignature = async (signature: GeneratedSignature) => {
	if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
		try {
			await navigator.clipboard.write([
				new ClipboardItem({
					"text/html": new Blob([signature.html], { type: "text/html" }),
					"text/plain": new Blob([signature.plainText], { type: "text/plain" }),
				}),
			]);
			return;
		} catch {
			// Older browsers can expose ClipboardItem while rejecting rich clipboard writes.
		}
	}

	copyRenderedHtmlFallback(signature.html);
};

export const SignatureDialog = ({ face, open, onClose }: SignatureDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const keyRef = useRef("");
	const [step, setStep] = useState<"details" | "choice" | "result">("details");
	const [key, setKey] = useState("");
	const [name, setName] = useState("");
	const [position, setPosition] = useState("");
	const [savedAssignment, setSavedAssignment] = useState<SavedAssignment>(null);
	const [lookedUpKey, setLookedUpKey] = useState("");
	const [signature, setSignature] = useState<GeneratedSignature | null>(null);
	const [error, setError] = useState("");
	const [announcement, setAnnouncement] = useState("");
	const [isLookupPending, startLookupTransition] = useTransition();
	const [isGenerating, startGenerationTransition] = useTransition();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	if (!open) return null;
	const normalizedKey = normalizeLookupKey(key);
	const detailsEnabled = Boolean(normalizedKey && lookedUpKey === normalizedKey && !isLookupPending);

	const requestLookup = async (lookupKey: string) => {
		try {
			const result = await lookupFaceAssignment(lookupKey);
			if (normalizeLookupKey(keyRef.current) !== lookupKey) return;
			if (!result.ok) {
				setError(result.error);
				setLookedUpKey("");
				return;
			}

			setSavedAssignment(result.assignment);
			setLookedUpKey(lookupKey);
			if (result.assignment) {
				setName(result.assignment.name);
				setPosition(result.assignment.position);
			}
		} catch {
			if (normalizeLookupKey(keyRef.current) === lookupKey) {
				setError("The saved details could not be checked. Please try again.");
				setLookedUpKey("");
			}
		}
	};

	const handleEmailChange = (value: string) => {
		keyRef.current = value;
		setKey(value);
		setLookedUpKey("");
		setSavedAssignment(null);
		setName("");
		setPosition("");
		setError("");
	};

	const handleEmailBlur = () => {
		const lookupKey = normalizeLookupKey(keyRef.current);
		if (!lookupKey || lookedUpKey === lookupKey) return;

		setError("");
		startLookupTransition(async () => {
			await requestLookup(lookupKey);
		});
	};

	const requestGeneration = async (mode: "saved" | "current") => {
		try {
			const result = await generateEmailSignature({
				key,
				name,
				position,
				mode,
				face: mode === "current" ? face : undefined,
			});
			if (!result.ok) {
				setError(result.error);
				return;
			}

			setSignature(result);
			setStep("result");
			setAnnouncement("Email signature generated.");
		} catch {
			setError("The signature could not be generated. Please try again.");
		}
	};

	const generate = (mode: "saved" | "current") => {
		setError("");
		startGenerationTransition(() => requestGeneration(mode));
	};

	const handleDetailsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		if (!detailsEnabled) {
			handleEmailBlur();
			return;
		}

		if (savedAssignment) {
			setStep("choice");
			return;
		}

		generate("current");
	};

	const handleClose = () => {
		dialogRef.current?.close();
		setStep("details");
		keyRef.current = "";
		setKey("");
		setName("");
		setPosition("");
		setLookedUpKey("");
		setSavedAssignment(null);
		setSignature(null);
		setError("");
		setAnnouncement("");
		onClose();
	};

	const handleCopySignature = async () => {
		if (!signature) return;
		try {
			await copySignature(signature);
			setAnnouncement("Signature copied. Paste it into Gmail settings.");
		} catch {
			setError("Copy was blocked by the browser. Download the HTML file instead.");
		}
	};

	const handleCopySource = async () => {
		if (!signature) return;
		try {
			await navigator.clipboard.writeText(signature.documentHtml);
			setAnnouncement("HTML source copied.");
		} catch {
			setError("The browser could not copy the HTML source.");
		}
	};

	const handleDownload = () => {
		if (!signature) return;
		const url = URL.createObjectURL(
			new Blob([signature.documentHtml], { type: "text/html;charset=utf-8" }),
		);
		const link = document.createElement("a");
		link.href = url;
		link.download = "humaan-email-signature.html";
		link.click();
		window.setTimeout(() => URL.revokeObjectURL(url), 0);
		setAnnouncement("HTML file downloaded.");
	};

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-labelledby="signature-dialog-title"
			onCancel={event => {
				event.preventDefault();
				handleClose();
			}}
		>
			<div className={styles.dialog__header}>
				<div>
					<p className={styles.dialog__eyebrow}>Email signature</p>
					<h2 id="signature-dialog-title">
						{step === "details" && "Add your details"}
						{step === "choice" && "Choose a face"}
						{step === "result" && "Your signature is ready"}
					</h2>
				</div>
				<button
					type="button"
					className={styles.dialog__close}
					onClick={handleClose}
					aria-label="Close email signature dialog"
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>

			{step === "details" && (
				<form
					className={styles.form}
					onSubmit={handleDetailsSubmit}
				>
					<label>
						<span>Email</span>
						<input
							type="text"
							value={key}
							onChange={event => handleEmailChange(event.target.value)}
							onBlur={handleEmailBlur}
							autoComplete="email"
							required
							autoFocus
							disabled={isGenerating}
						/>
						<span
							className={styles.form__status}
							aria-live="polite"
						>
							{isLookupPending ? "Looking up saved details…" : ""}
						</span>
					</label>
					<label>
						<span>Name</span>
						<input
							type="text"
							value={name}
							onChange={event => setName(event.target.value)}
							autoComplete="name"
							required
							disabled={!detailsEnabled || isGenerating}
						/>
					</label>
					<label>
						<span>Position</span>
						<input
							type="text"
							value={position}
							onChange={event => setPosition(event.target.value)}
							autoComplete="organization-title"
							required
							disabled={!detailsEnabled || isGenerating}
						/>
					</label>
					<button
						type="submit"
						className={styles.primaryButton}
						disabled={!detailsEnabled || isGenerating}
					>
						{isLookupPending ? "Looking up…" : isGenerating ? "Generating…" : "Continue"}
					</button>
				</form>
			)}

			{step === "choice" && savedAssignment && (
				<div className={styles.choice}>
					<p>A face is already saved for this email. Which one should the signature use?</p>
					<div className={styles.choice__grid}>
						<button
							type="button"
							onClick={() => generate("saved")}
							disabled={isGenerating}
						>
							<FaceCanvas face={savedAssignment.face} />
							<strong>Use saved face</strong>
						</button>
						<button
							type="button"
							onClick={() => generate("current")}
							disabled={isGenerating}
						>
							<FaceCanvas face={face} />
							<strong>Use current face</strong>
							<small>This replaces the saved face.</small>
						</button>
					</div>
					<button
						type="button"
						className={styles.textButton}
						onClick={() => setStep("details")}
						disabled={isGenerating}
					>
						Back to details
					</button>
				</div>
			)}

			{step === "result" && signature && (
				<div className={styles.result}>
					<div className={styles.result__preview}>
						<iframe
							title="Generated email signature"
							sandbox=""
							srcDoc={signature.documentHtml}
						/>
					</div>
					<div className={styles.result__actions}>
						<button
							type="button"
							className={styles.primaryButton}
							onClick={handleCopySignature}
						>
							Copy signature
						</button>
						<button
							type="button"
							onClick={handleCopySource}
						>
							Copy HTML
						</button>
						<button
							type="button"
							onClick={handleDownload}
						>
							Download HTML
						</button>
					</div>
					<p className={styles.result__instructions}>
						In Gmail, open <strong>Settings → See all settings → General → Signature</strong>,
						 then paste and save.
					</p>
					{signature.templateUpdatedAt && (
						<p className={styles.result__meta}>
							Template updated {new Date(signature.templateUpdatedAt).toLocaleDateString()}.
						</p>
					)}
					<details>
						<summary>View HTML source</summary>
						<textarea
							aria-label="HTML source"
							readOnly
							value={signature.documentHtml}
							rows={10}
							onFocus={event => event.currentTarget.select()}
						/>
					</details>
				</div>
			)}

			{error && (
				<p
					className={styles.error}
					role="alert"
				>
					{error}
				</p>
			)}
			<p
				className={styles.srOnly}
				aria-live="polite"
			>
				{announcement}
			</p>
		</dialog>
	);
};
