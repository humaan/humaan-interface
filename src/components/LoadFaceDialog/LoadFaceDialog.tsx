"use client";

import { lookupFaceAssignment } from "@/actions/signature";
import { FaceCanvas } from "@/components/FaceBuilder/FaceCanvas";
import type { FaceState } from "@/domain/face/model";
import type { FaceLookupResult } from "@/domain/signature/actions.types";
import { useEffect, useRef, useState, useTransition } from "react";
import styles from "@/components/SignatureDialog/SignatureDialog.module.scss";

type LoadFaceDialogProps = {
	open: boolean;
	onClose: () => void;
	onLoad: (face: FaceState) => void;
};

type SavedAssignment = Extract<FaceLookupResult, { ok: true }>["assignment"];

export const LoadFaceDialog = ({ open, onClose, onLoad }: LoadFaceDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [email, setEmail] = useState("");
	const [assignment, setAssignment] = useState<SavedAssignment>(null);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	if (!open) return null;

	const handleClose = () => {
		dialogRef.current?.close();
		setEmail("");
		setAssignment(null);
		setError("");
		onClose();
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setAssignment(null);
		startTransition(async () => {
			try {
				const result = await lookupFaceAssignment(email);
				if (!result.ok) {
					setError(result.error);
					return;
				}
				if (!result.assignment) {
					setError("No saved face was found for that email.");
					return;
				}
				setAssignment(result.assignment);
			} catch {
				setError("The saved face could not be loaded. Please try again.");
			}
		});
	};

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-labelledby="load-face-dialog-title"
			onCancel={event => {
				event.preventDefault();
				handleClose();
			}}
		>
			<div className={styles.dialog__header}>
				<div>
					<p className={styles.dialog__eyebrow}>Saved face</p>
					<h2 id="load-face-dialog-title">Load a face</h2>
				</div>
				<button
					type="button"
					className={styles.dialog__close}
					onClick={handleClose}
					aria-label="Close load face dialog"
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>

			<form
				className={styles.form}
				onSubmit={handleSubmit}
			>
				<label>
					<span>Email</span>
					<input
						type="text"
						value={email}
						onChange={event => setEmail(event.target.value)}
						autoComplete="email"
						required
						autoFocus
					/>
				</label>
				<button
					type="submit"
					className={styles.primaryButton}
					disabled={isPending}
				>
					{isPending ? "Looking up…" : "Find saved face"}
				</button>
			</form>

			{assignment && (
				<div className={styles.choice}>
					<div className={`${styles.choice__grid} ${styles["choice__grid--single"]}`}>
						<button
							type="button"
							onClick={() => {
								onLoad(assignment.face);
								handleClose();
							}}
						>
							<FaceCanvas face={assignment.face} />
							<strong>Load this face</strong>
						</button>
					</div>
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
		</dialog>
	);
};
