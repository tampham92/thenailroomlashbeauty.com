import { readTeam, type TeamMember } from "@/lib/content";

export type { TeamMember };

export async function getTeam(): Promise<{
  hero: string;
  members: TeamMember[];
}> {
  return readTeam();
}
