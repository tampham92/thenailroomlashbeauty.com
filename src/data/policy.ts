import { readPolicy, type PolicyFile, type PolicyItem } from "@/lib/content";

export type { PolicyFile, PolicyItem };

export async function getPolicy(): Promise<PolicyFile> {
  return readPolicy();
}
