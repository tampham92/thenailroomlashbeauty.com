import { readTeam } from "@/lib/content";
import TeamEditor from "./TeamEditor";

export default async function AdminTeamPage() {
  const team = await readTeam();
  return <TeamEditor team={team} />;
}
