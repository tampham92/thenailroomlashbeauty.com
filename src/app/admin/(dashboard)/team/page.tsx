import { readTeam } from "@/lib/content";
import { resolveTeam } from "@/data/team";
import TeamEditor from "./TeamEditor";

export default async function AdminTeamPage() {
  return <TeamEditor team={resolveTeam(await readTeam())} />;
}
