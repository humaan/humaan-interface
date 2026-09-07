import type { Metadata } from "next";
import { FacePartDebug } from "@/components/FacePartDebug/FacePartDebug";

export const metadata: Metadata = {
	title: "Face part debug | Humaan Interface",
	description: "Inspect every face part and its layout metadata.",
};

export default function DebugPage() {
	return <FacePartDebug />;
}
