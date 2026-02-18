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
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category, Contact } from "@/types/contacts";

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

function filterContactsByQuery(
  categories: Category[],
  searchQuery: string
): Category[] {
  const query = searchQuery.toLowerCase();
  return categories
    .map((category) => ({
      ...category,
      contacts: category.contacts.filter((contact) => {
        const productMatch = contact.product.toLowerCase().includes(query);
        const handleMatch = contact.handles.some((handle) =>
          handle.toLowerCase().includes(query)
        );
        const emailMatch = contact.email?.toLowerCase().includes(query);
        return productMatch || handleMatch || emailMatch;
      }),
    }))
    .filter((category) => category.contacts.length > 0);
}

function isContactHighlighted(contact: Contact, searchQuery: string): boolean {
  if (!searchQuery) return false;
  const query = searchQuery.toLowerCase();
  return (
    contact.product.toLowerCase().includes(query) ||
    contact.handles.some((handle) => handle.toLowerCase().includes(query)) ||
    Boolean(contact.email?.toLowerCase().includes(query))
  );
}

function CompanyLinks({
  website,
  docs,
  github,
  discord,
}: {
  website?: string;
  docs?: string;
  github?: string;
  discord?: string;
}) {
  if (!(website || docs || github || discord)) return null;

  const linkClass =
    "inline-flex items-center gap-1.5 rounded-lg bg-secondary/70 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-secondary";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {website ? (
        <a className={linkClass} href={website} rel="noopener noreferrer" target="_blank">
          <Globe className="h-3.5 w-3.5" />
          <span>Website</span>
        </a>
      ) : null}
      {docs ? (
        <a className={linkClass} href={docs} rel="noopener noreferrer" target="_blank">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Docs</span>
        </a>
      ) : null}
      {github ? (
        <a className={linkClass} href={github} rel="noopener noreferrer" target="_blank">
          <Github className="h-3.5 w-3.5" />
          <span>GitHub</span>
        </a>
      ) : null}
      {discord ? (
        <a className={linkClass} href={discord} rel="noopener noreferrer" target="_blank">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Discord</span>
        </a>
      ) : null}
    </div>
  );
}

function ContactItem({
  contact,
  isFirstMatch,
  isHighlighted,
  copiedProduct,
  firstMatchRef,
  onCopy,
}: {
  contact: Contact;
  isFirstMatch: boolean;
  isHighlighted: boolean;
  copiedProduct: string | null;
  firstMatchRef: React.RefObject<HTMLDivElement | null>;
  onCopy: (product: string, handles: string[]) => void;
}) {
  return (
    <div
      className={`flex scroll-mt-24 items-start justify-between border-border/40 border-t py-3.5 transition-colors duration-200 first:border-t-0 ${
        isHighlighted ? "bg-accent/5 -mx-3 px-3 rounded-lg" : ""
      }`}
      ref={isFirstMatch ? firstMatchRef : null}
    >
      <div className="flex-1">
        <button
          className={`cursor-pointer text-left font-medium text-sm transition-colors duration-200 hover:text-accent ${
            isHighlighted
              ? "text-accent"
              : "text-foreground"
          }`}
          onClick={() => onCopy(contact.product, contact.handles)}
          title="Click to copy all handles"
          type="button"
        >
          {copiedProduct === contact.product ? (
            <span className="text-green-600 dark:text-green-400">Copied!</span>
          ) : (
            contact.product
          )}
        </button>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {contact.email ? (
            <a
              className="flex items-center gap-1 text-muted-foreground text-xs transition-colors duration-200 hover:text-accent"
              href={`mailto:${contact.email}`}
            >
              <Mail className="h-3 w-3" />
              <span>{contact.email}</span>
            </a>
          ) : null}
          {contact.discord ? (
            <a
              className="flex items-center gap-1 text-muted-foreground text-xs transition-colors duration-200 hover:text-accent"
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
            <HandleLink handle={handle} key={handle} />
          ))
        ) : (
          <>
            {contact.handles.slice(0, 2).map((handle) => (
              <HandleLink handle={handle} key={handle} />
            ))}
            <Popover>
              <PopoverTrigger className="text-muted-foreground text-xs transition-colors duration-200 hover:text-accent">
                +{contact.handles.length - 2} more
              </PopoverTrigger>
              <PopoverContent className="w-auto bg-popover p-2 shadow-lg">
                <div className="flex flex-col gap-1.5">
                  {contact.handles.slice(2).map((handle) => (
                    <HandleLink handle={handle} key={handle} />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </div>
  );
}

function HandleLink({ handle }: { handle: string }) {
  return (
    <a
      className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors duration-200 hover:text-accent"
      href={`https://x.com/${handle.replace("@", "")}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarImage
          alt={handle}
          src={`https://unavatar.io/x/${handle.replace("@", "")}?fallback=https://avatar.vercel.sh/${handle.replace("@", "")}?size=400`}
        />
        <AvatarFallback className="bg-secondary text-[10px] text-muted-foreground">
          {handle.slice(1, 3).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="leading-none">{handle}</span>
    </a>
  );
}

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

  const filteredCategories = filterContactsByQuery(categories, searchQuery);

  const firstMatchingProduct =
    filteredCategories.length > 0 && filteredCategories[0].contacts.length > 0
      ? filteredCategories[0].contacts[0].product
      : null;

  useEffect(() => {
    if (searchQuery && firstMatchRef.current) {
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
    <main className="mx-auto max-w-4xl px-6 pt-8 pb-20 md:pt-12 md:pb-28">
      <Link
        className="mb-6 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground animate-fade-in"
        to="/"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      <h1 className="mb-6 flex items-center gap-2 font-semibold text-2xl text-foreground tracking-tight md:text-3xl animate-slide-up">
        who to bother at{" "}
        <span className="inline-flex items-center [&>svg]:h-6 [&>svg]:w-auto md:[&>svg]:h-7">
          {logo}
        </span>{" "}
        on{" "}
        <svg fill="none" height="24" viewBox="0 0 1200 1227" width="26">
          <title>X (Twitter) logo</title>
          <path
            d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
            fill="currentColor"
          />
        </svg>
      </h1>

      <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <CompanyLinks
          discord={discord}
          docs={docs}
          github={github}
          website={website}
        />
      </div>

      <p className="mt-6 text-muted-foreground text-xs leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
        This is a community-maintained list and not officially affiliated with{" "}
        {companyName}. For official support, visit the official {companyName}{" "}
        website.
      </p>

      <div className="mt-6 flex items-center gap-1.5 text-muted-foreground/60 text-xs">
        <Copy className="h-3.5 w-3.5" />
        <span>Click any topic to copy all contacts</span>
      </div>

      {/* Search */}
      <div className="relative mt-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {(() => {
          const hasSearch = Boolean(searchQuery) && Boolean(onSearchQueryChange);
          return (
            <>
              <input
                className={`w-full rounded-xl bg-secondary/70 px-4 py-2.5 text-foreground text-sm placeholder-muted-foreground outline-none transition-all duration-200 focus:bg-secondary focus:ring-2 focus:ring-accent/30 ${hasSearch ? "pr-10" : ""}`}
                onChange={(e) => onSearchQueryChange?.(e.target.value || null)}
                placeholder="Search products or topics..."
                type="text"
                value={searchQuery}
              />
              {hasSearch ? (
                <button
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  onClick={() => onSearchQueryChange?.(null)}
                  type="button"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <title>Clear search</title>
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </button>
              ) : null}
            </>
          );
        })()}
      </div>

      {/* Categories */}
      <div className="mt-8 space-y-10">
        {filteredCategories.map((category, catIdx) => (
          <div className="animate-slide-up" key={category.name} style={{ animationDelay: `${0.05 * catIdx + 0.15}s` }}>
            <h2 className="mb-3 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
              {category.name}
            </h2>
            <div>
              {category.contacts.map((contact, contactIndex) => {
                const isFirstMatch =
                  contactIndex === 0 &&
                  category === filteredCategories[0] &&
                  contact.product === firstMatchingProduct;
                const isHighlighted = isContactHighlighted(contact, searchQuery);

                return (
                  <ContactItem
                    contact={contact}
                    copiedProduct={copiedProduct}
                    firstMatchRef={firstMatchRef}
                    isFirstMatch={isFirstMatch}
                    isHighlighted={isHighlighted}
                    key={contact.product}
                    onCopy={copyHandlesToClipboard}
                  />
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
  );
}
