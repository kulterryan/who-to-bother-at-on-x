import { Link } from "@tanstack/react-router";
import { MobileThemeToggle, ModeToggle } from "@/components/theme-toggle";

type FooterProps = {
  contributionTitle?: string;
  contributionMessage?: string;
};

export function Footer({
  contributionTitle = "Want to add your company?",
  contributionMessage = "This is a community-maintained directory. Have more contacts or companies to add?",
}: FooterProps) {
  return (
    <footer className="mt-16 space-y-8 animate-fade-in">
      {/* CTA Card */}
      <div className="rounded-2xl bg-secondary/60 p-6">
        <h3 className="mb-2 font-semibold text-foreground text-base">
          {contributionTitle}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {contributionMessage}{" "}
          <Link
            className="font-medium text-accent underline underline-offset-4 transition-colors duration-200 hover:text-accent/80"
            to="/contribute"
          >
            Contribute directly from the website
          </Link>{" "}
          or{" "}
          <a
            className="font-medium text-accent underline underline-offset-4 transition-colors duration-200 hover:text-accent/80"
            href="https://github.com/kulterryan/who-to-bother-at-on-x"
            rel="noopener noreferrer"
            target="_blank"
          >
            submit a PR on GitHub
          </a>
          . Reach out to{" "}
          <a
            className="font-medium text-accent underline underline-offset-4 transition-colors duration-200 hover:text-accent/80"
            href="https://x.com/thehungrybird_"
            rel="noopener noreferrer"
            target="_blank"
          >
            @thehungrybird_
          </a>{" "}
          if you have questions.
        </p>
      </div>

      {/* Credits + Theme */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-muted-foreground text-xs">
          Created by{" "}
          <a
            className="font-medium text-foreground transition-colors duration-200 hover:text-accent"
            href="https://x.com/thehungrybird_"
            rel="noopener noreferrer"
            target="_blank"
          >
            @thehungrybird_
          </a>
          {" / "}
          Concept by{" "}
          <a
            className="font-medium text-foreground transition-colors duration-200 hover:text-accent"
            href="https://x.com/strehldev"
            rel="noopener noreferrer"
            target="_blank"
          >
            @strehldev
          </a>
        </p>
        <div className="hidden sm:block">
          <ModeToggle />
        </div>
        <div className="sm:hidden">
          <MobileThemeToggle />
        </div>
      </div>
    </footer>
  );
}
