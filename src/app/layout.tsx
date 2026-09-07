import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/style.scss";

export const metadata: Metadata = {
	title: "Humaan Interface",
	description: "Build a one-of-a-kind Humaan face.",
};

export const viewport: Viewport = {
	themeColor: "#29272d",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
