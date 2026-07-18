import { superOwnerSeed } from "./superowner.seed";
import { siteSettingsSeed } from "./siteSettings.seed";

export async function indexSeed() {
  await superOwnerSeed();
  await siteSettingsSeed();
}
