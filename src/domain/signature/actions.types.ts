import type { FaceState } from "@/domain/face/model";

export type FaceLookupResult =
	| { ok: true; assignment: null }
	| {
			ok: true;
			assignment: {
				face: FaceState;
				name: string;
				position: string;
				updatedAt: string;
			};
	  }
	| { ok: false; error: string };

export type GenerateSignatureInput = {
	key: string;
	name: string;
	position: string;
	mode: "saved" | "current";
	face?: FaceState;
};

export type GenerateSignatureResult =
	| {
			ok: true;
			html: string;
			plainText: string;
			documentHtml: string;
			faceUrl: string;
			templateUpdatedAt: string | null;
	  }
	| { ok: false; error: string };
