import { readPolicy } from "@/lib/content";
import PolicyEditor from "./PolicyEditor";

export default async function AdminPolicyPage() {
  const policy = await readPolicy();
  return <PolicyEditor policy={policy} />;
}
