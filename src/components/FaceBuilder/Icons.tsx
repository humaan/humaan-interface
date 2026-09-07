import type { SVGProps } from "react";
import FlipSvg from "@/assets/flip.svg";
import HumaanLogoSvg from "@/assets/humaan-logo.svg";

type IconProps = SVGProps<SVGSVGElement>;

export const CheckIcon = (props: IconProps) => (
	<svg
		viewBox="0 0 16 16"
		aria-hidden="true"
		{...props}
	>
		<path
			d="m3.25 8.25 3 3 6.5-6.5"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		/>
	</svg>
);

export const CentreIcon = (props: IconProps) => (
	<svg
		viewBox="0 0 20 20"
		aria-hidden="true"
		{...props}
	>
		<path
			d="M7 3H3v4m10-4h4v4M7 17H3v-4m10 4h4v-4"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.7"
		/>
		<circle
			cx="10"
			cy="10"
			r="2"
			fill="currentColor"
		/>
	</svg>
);

export const DownloadIcon = (props: IconProps) => (
	<svg
		viewBox="0 0 20 20"
		aria-hidden="true"
		{...props}
	>
		<path
			d="M10 2v10m0 0 4-4m-4 4L6 8M3 13.5V17h14v-3.5"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.8"
		/>
	</svg>
);

export const EmailIcon = (props: IconProps) => (
	<svg
		viewBox="0 0 20 20"
		aria-hidden="true"
		{...props}
	>
		<rect
			x="2.5"
			y="4"
			width="15"
			height="12"
			rx="1.5"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.7"
		/>
		<path
			d="m3.5 5 6.5 5 6.5-5"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.7"
		/>
	</svg>
);

export const FlipIcon = (props: IconProps) => (
	<FlipSvg
		aria-hidden="true"
		{...props}
	/>
);

export const HumaanLogo = (props: IconProps) => (
	<HumaanLogoSvg
		aria-hidden="true"
		{...props}
	/>
);

export const LockIcon = ({ locked = false, ...props }: IconProps & { locked?: boolean }) => (
	<svg
		viewBox="0 0 20 20"
		aria-hidden="true"
		{...props}
	>
		<path
			d={locked ? "M6 9V6a4 4 0 0 1 8 0v3" : "M14 9V6a4 4 0 0 0-7.78-1.3"}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeWidth="1.7"
		/>
		<rect
			x="4.5"
			y="8.5"
			width="11"
			height="8"
			rx="1.5"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.7"
		/>
	</svg>
);

export const ShuffleIcon = (props: IconProps) => (
	<svg
		viewBox="0 0 20 20"
		aria-hidden="true"
		{...props}
	>
		<path
			d="M14.5 3.5H17v2.75M3 5h2.1c4.8 0 4.8 10 9.7 10H17m-2.5 1.5L17 15v-2.75M3 15h2.1c1.45 0 2.42-.91 3.22-2.13M11.7 7.2C12.5 5.97 13.46 5 14.8 5H17"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.7"
		/>
	</svg>
);
