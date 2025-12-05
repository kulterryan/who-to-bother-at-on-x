import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Github,
  Globe,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category } from "@/types/contacts";

type ContactsListProps = {
  categories: Category[];
  companyName: string;
  logo: React.ReactNode;
  searchQuery?: string;
  onSearchQueryChange?: (query: string | null) => void;
  website?: string;
  docs?: string;
  github?: string;
  discord?: string;
};

export function ContactsList({
  categories,
  companyName,
  logo,
  searchQuery = "",
  onSearchQueryChange,
  website,
  docs,
  github,
  discord,
}: ContactsListProps) {
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null);
  const firstMatchRef = useRef<HTMLDivElement | null>(null);

  const filteredCategories: Category[] = categories
    .map((category) => ({
      ...category,
      contacts: category.contacts.filter((contact) => {
        const query = searchQuery.toLowerCase();
        const productMatch = contact.product.toLowerCase().includes(query);
        const handleMatch = contact.handles.some((handle) =>
          handle.toLowerCase().includes(query)
        );
        const emailMatch = contact.email?.toLowerCase().includes(query);
        return productMatch || handleMatch || emailMatch;
      }),
    }))
    .filter((category) => category.contacts.length > 0);

  // Find the first matching product for scrolling
  const firstMatchingProduct =
    filteredCategories.length > 0 && filteredCategories[0].contacts.length > 0
      ? filteredCategories[0].contacts[0].product
      : null;

  // Scroll to first matching product when search query changes
  useEffect(() => {
    if (searchQuery && firstMatchRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        firstMatchRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [searchQuery]);

  const copyHandlesToClipboard = async (
    product: string,
    handles: string[]
  ): Promise<void> => {
    const handlesString = handles.join(" ");
    try {
      await navigator.clipboard.writeText(handlesString);
      setCopiedProduct(product);
      setTimeout(() => setCopiedProduct(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
        <Link
          className="mb-8 inline-flex items-center gap-2 font-medium text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
          to="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="mb-6 flex items-center gap-2 text-balance font-medium text-2xl text-zinc-900 md:text-3xl dark:text-zinc-100">
          who to bother at {logo} on{" "}
          <svg fill="none" height="30" viewBox="0 0 1200 1227" width="33">
            <title>X (Twitter)</title>
            <path
              d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
              fill="currentColor"
            />
          </svg>
        </h1>

        {Boolean(website || docs || github || discord) && (
          <div className="mb-8 flex flex-wrap items-center gap-4">
            {website ? (
              <a
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
                href={website}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </a>
            ) : null}
            {docs ? (
              <a
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
                href={docs}
                rel="noopener noreferrer"
                target="_blank"
              >
                <BookOpen className="h-4 w-4" />
                <span>Docs</span>
              </a>
            ) : null}
            {github ? (
              <a
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
                href={github}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            ) : null}
            {discord ? (
              <a
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
                href={discord}
                rel="noopener noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Discord</span>
              </a>
            ) : null}
          </div>
        )}

        <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-500">
          This is a community-maintained list and not officially affiliated with{" "}
          {companyName}. For official support, visit the official {companyName}{" "}
          website.
        </p>

        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Copy className="h-4 w-4" />
          <span>Click any topic to copy all contacts</span>
        </div>

        <div className="relative mb-8">
          <input
            className={`w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 ${!!searchQuery && !!onSearchQueryChange ? "pr-11" : ""}`}
            onChange={(e) => onSearchQueryChange?.(e.target.value || null)}
            placeholder="search products or topics"
            type="text"
            value={searchQuery}
          />
          {!!searchQuery && !!onSearchQueryChange && (
            <button
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={() => onSearchQueryChange?.(null)}
              type="button"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Close</title>
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-12">
          {filteredCategories.map((category: Category) => (
            <div key={category.name}>
              <h2 className="mb-4 font-medium text-xs text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                {category.name}
              </h2>
              <div className="space-y-px">
                {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Contact rendering with search highlighting */}
                {category.contacts.map((contact, contactIndex) => {
                  const isFirstMatch =
                    contactIndex === 0 &&
                    category === filteredCategories[0] &&
                    contact.product === firstMatchingProduct;

                  const searchLower = searchQuery?.toLowerCase() ?? "";
                  const hasProductMatch = contact.product
                    .toLowerCase()
                    .includes(searchLower);
                  const hasHandleMatch = contact.handles.some((handle) =>
                    handle.toLowerCase().includes(searchLower)
                  );
                  const hasEmailMatch =
                    contact.email?.toLowerCase().includes(searchLower) ?? false;
                  const isHighlighted =
                    !!searchQuery &&
                    (hasProductMatch || hasHandleMatch || hasEmailMatch);

                  return (
                    <div
                      className="flex scroll-mt-24 items-start justify-between border-zinc-200 border-t py-4 transition-colors first:border-t-0 dark:border-zinc-800"
                      key={contact.product}
                      ref={isFirstMatch ? firstMatchRef : null}
                    >
                      <div className="flex-1">
                        <button
                          className={`cursor-pointer text-left font-medium text-sm transition-colors hover:text-orange-600 md:text-base dark:hover:text-orange-600 ${
                            isHighlighted
                              ? "font-semibold text-orange-700 dark:text-orange-300"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                          onClick={() =>
                            copyHandlesToClipboard(
                              contact.product,
                              contact.handles
                            )
                          }
                          title="Click to copy all handles"
                          type="button"
                        >
                          {copiedProduct === contact.product ? (
                            <span className="text-green-600">Copied!</span>
                          ) : (
                            contact.product
                          )}
                        </button>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {contact.email ? (
                            <a
                              className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-orange-600 md:text-sm dark:text-zinc-400 dark:hover:text-orange-600"
                              href={`mailto:${contact.email}`}
                            >
                              <Mail className="h-3 w-3" />
                              <span>{contact.email}</span>
                            </a>
                          ) : null}
                          {contact.discord ? (
                            <a
                              className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-orange-600 md:text-sm dark:text-zinc-400 dark:hover:text-orange-600"
                              href={contact.discord}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>Discord</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                        {contact.handles.length <= 2 ? (
                          contact.handles.map((handle) => (
                            <a
                              className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-400 dark:hover:text-orange-600"
                              href={`https://x.com/${handle.replace("@", "")}`}
                              key={handle}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Avatar className="h-5 w-5 shrink-0">
                                <AvatarImage
                                  alt={handle}
                                  src={`https://unavatar.io/x/${handle.replace("@", "")}?fallback=https://avatar.vercel.sh/${handle.replace("@", "")}?size=400`}
                                />
                                <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                  {handle.slice(1, 3).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="leading-none">{handle}</span>
                            </a>
                          ))
                        ) : (
                          <>
                            {contact.handles.slice(0, 2).map((handle) => (
                              <a
                                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-400 dark:hover:text-orange-600"
                                href={`https://x.com/${handle.replace("@", "")}`}
                                key={handle}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <Avatar className="h-5 w-5 shrink-0">
                                  <AvatarImage
                                    alt={handle}
                                    src={`https://unavatar.io/x/${handle.replace("@", "")}?fallback=https://avatar.vercel.sh/${handle.replace("@", "")}?size=400`}
                                  />
                                  <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    {handle.slice(1, 3).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="leading-none">{handle}</span>
                              </a>
                            ))}
                            <Popover>
                              <PopoverTrigger className="text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-400 dark:hover:text-orange-600">
                                more
                              </PopoverTrigger>
                              <PopoverContent className="w-auto border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="flex flex-col gap-2">
                                  {contact.handles.slice(2).map((handle) => (
                                    <a
                                      className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600"
                                      href={`https://x.com/${handle.replace("@", "")}`}
                                      key={handle}
                                      rel="noopener noreferrer"
                                      target="_blank"
                                    >
                                      <Avatar className="h-5 w-5 shrink-0">
                                        <AvatarImage
                                          alt={handle}
                                          src={`https://unavatar.io/x/${handle.replace("@", "")}`}
                                        />
                                        <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                          {handle.slice(1, 3).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="leading-none">
                                        {handle}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Footer
          contributionMessage="This is a community-maintained directory. Have more contacts to add?"
          contributionTitle="Want to add more contacts?"
        />
      </main>
    </div>
  );
}
