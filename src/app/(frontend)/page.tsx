import { FaceBuilder } from "@/components/FaceBuilder/FaceBuilder";
import { createRandomFace } from "@/domain/face/model";
import { connection } from "next/server";

export default async function HomePage() {
	await connection();

	return <FaceBuilder initialFace={createRandomFace()} />;
}
