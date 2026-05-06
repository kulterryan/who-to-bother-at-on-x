import { Github, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommunityDeveloper } from "@/types/contacts";

function CommunityDeveloperRow({
  developer,
  isHighlighted,
}: {
  developer: CommunityDeveloper;
  isHighlighted: boolean;
}) {
  const handle = developer.handle.replace("@", "");
  const xUrl = `https://x.com/${handle}`;

  return (
    <div className="flex scroll-mt-24 items-start justify-between border-zinc-200 border-t py-4 transition-colors first:border-t-0 dark:border-zinc-800">
      <div className="flex-1">
        <span
          className={`font-medium text-sm md:text-base ${
            isHighlighted
              ? "font-semibold text-orange-700 dark:text-orange-300"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {developer.name}
        </span>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {developer.specialty}
        </p>
        {(developer.projects?.length ||
          developer.github ||
          developer.website) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {developer.projects?.map((project) => (
              <a
                className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-orange-600 md:text-sm dark:text-zinc-400 dark:hover:text-orange-600"
                href={project.url}
                key={project.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>📦</span>
                {project.name}
              </a>
            ))}
            {developer.github && (
              <a
                className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-orange-600 md:text-sm dark:text-zinc-400 dark:hover:text-orange-600"
                href={developer.github}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Github className="h-3 w-3" />
                GitHub
              </a>
            )}
            {developer.website && (
              <a
                className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-orange-600 md:text-sm dark:text-zinc-400 dark:hover:text-orange-600"
                href={developer.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Globe className="h-3 w-3" />
                Website
              </a>
            )}
          </div>
        )}
      </div>
      <a
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-400 dark:hover:text-orange-600"
        href={xUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarImage
            alt={developer.handle}
            src={`https://unavatar.io/x/${handle}?fallback=https://avatar.vercel.sh/${handle}?size=400`}
          />
          <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {developer.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="leading-none">{developer.handle}</span>
      </a>
    </div>
  );
}

// Helper function to check if developer matches search query
function isDeveloperHighlighted(
  developer: CommunityDeveloper,
  searchQuery: string
): boolean {
  if (!searchQuery) return false;
  const query = searchQuery.toLowerCase();
  return (
    developer.name.toLowerCase().includes(query) ||
    developer.handle.toLowerCase().includes(query) ||
    developer.specialty.toLowerCase().includes(query) ||
    developer.focusAreas?.some((area) => area.toLowerCase().includes(query)) ||
    developer.projects?.some((project) =>
      project.name.toLowerCase().includes(query)
    )
  );
}

// Helper function to filter community developers by search query
export function filterCommunityDevelopers(
  developers: CommunityDeveloper[],
  searchQuery: string
): CommunityDeveloper[] {
  if (!searchQuery) return developers;
  return developers.filter((developer) =>
    isDeveloperHighlighted(developer, searchQuery)
  );
}

export function CommunityDevelopersSection({
  developers,
  searchQuery = "",
}: {
  developers: CommunityDeveloper[];
  searchQuery?: string;
}) {
  const filteredDevelopers = filterCommunityDevelopers(developers, searchQuery);

  if (filteredDevelopers.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="mb-1 font-medium text-xs text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
        Community Developers
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-500">
        Independent developers and OSS maintainers building on the ecosystem.
        Not affiliated with the company.
      </p>
      <div className="space-y-px">
        {filteredDevelopers.map((developer) => (
          <CommunityDeveloperRow
            developer={developer}
            isHighlighted={isDeveloperHighlighted(developer, searchQuery)}
            key={developer.handle}
          />
        ))}
      </div>
    </div>
  );
}
