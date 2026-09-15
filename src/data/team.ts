import {
  normalizeBanner,
  readTeam,
  type PageBanner,
  type TeamFile,
  type TeamMember,
} from "@/lib/content";

export type { TeamMember };

export type Team = { banner: PageBanner; members: TeamMember[] };

export function resolveTeam(file: TeamFile): Team {
  return {
    banner: normalizeBanner(file.banner, {
      image: file.hero ?? "",
      eyebrow: "The people behind the studio",
      title: "Meet Our Team",
      lead: "",
      textPlacement: "overlay",
    }),
    members: file.members,
  };
}

export async function getTeam(): Promise<Team> {
  return resolveTeam(await readTeam());
}
