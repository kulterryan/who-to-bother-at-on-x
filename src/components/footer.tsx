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
    <footer className="mt-16">
      <div className="rounded-lg bg-zinc-50 p-6 dark:bg-zinc-900/50">
        <h3 className="mb-2 font-medium text-lg text-zinc-900 dark:text-zinc-100">
          {contributionTitle}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {contributionMessage}{" "}
          <Link
            className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
            to="/contribute"
          >
            Contribute directly from the website
          </Link>{" "}
          or submit a PR on GitHub. Reach out to{" "}
          <a
            className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
            href="https://x.com/thehungrybird_"
            rel="noopener noreferrer"
            target="_blank"
          >
            @thehungrybird_
          </a>{" "}
          if you have questions.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Created by:{" "}
        <a
          className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
          href="https://x.com/thehungrybird_"
          rel="noopener noreferrer"
          target="_blank"
        >
          @thehungrybird_
        </a>
        {" · "}
        Concept by:{" "}
        <a
          className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
          href="https://x.com/strehldev"
          rel="noopener noreferrer"
          target="_blank"
        >
          @strehldev
        </a>
      </p>

      {/* Theme Switcher */}
      <div className="mt-6 flex justify-center">
        {/* Desktop theme toggle */}
        <div className="hidden sm:block">
          <ModeToggle />
        </div>
        {/* Mobile theme toggle */}
        <div className="sm:hidden">
          <MobileThemeToggle />
        </div>
      </div>
    </footer>
  );
}
