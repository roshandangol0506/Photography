import { superOwnerSeed } from "./superowner.seed";

export async function indexSeed() {
  await superOwnerSeed();
}
