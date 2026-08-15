import { client } from "./client";
import { AIRecommendation, BodyMeasurements, StyleProfile } from "../types";

export async function getRecommendations(
  imageBase64: string,
  mediaType: string,
  preferences: StyleProfile,
  measurements?: BodyMeasurements
): Promise<{ items: AIRecommendation[] }> {
  const { data } = await client.post("/recommendations", { imageBase64, mediaType, preferences, measurements });
  return data;
}
