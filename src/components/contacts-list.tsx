'use client';

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, ArrowLeft, Mail } from 'lucide-react';
import type { Category } from '@/types/contacts';
import { ModeToggle } from '@/components/theme-toggle';

interface ContactsListProps {
  categories: Category[];
  companyName: string;
  logo: React.ReactNode;
}

export function ContactsList({ categories, companyName, logo }: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null);

  const filteredCategories: Category[] = categories
    .map((category) => ({
      ...category,
      contacts: category.contacts.filter((contact) => {
        const query = searchQuery.toLowerCase();
        const productMatch = contact.product.toLowerCase().includes(query);
        const handleMatch = contact.handles.some((handle) => handle.toLowerCase().includes(query));
        const emailMatch = contact.email?.toLowerCase().includes(query);
        return productMatch || handleMatch || emailMatch;
      }),
    }))
    .filter((category) => category.contacts.length > 0);

  const copyHandlesToClipboard = async (product: string, handles: string[]): Promise<void> => {
    const handlesString = handles.join(' ');
    try {
      await navigator.clipboard.writeText(handlesString);
      setCopiedProduct(product);
      setTimeout(() => setCopiedProduct(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-600">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="mb-12 flex items-center gap-2 text-2xl font-medium text-balance text-zinc-900 dark:text-zinc-100 md:text-3xl">
          who to bother at {logo} on{' '}
          <svg fill="none" viewBox="0 0 1200 1227" width="33" height="30">
            <path fill="currentColor" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
          </svg>
        </h1>

        <p className="mb-8 text-sm text-zinc-600">
          This is a community-maintained list and not officially affiliated with {companyName}. For official support, visit the official {companyName} website.
        </p>

        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Copy className="h-4 w-4" />
          <span>Click any topic to copy all contacts</span>
        </div>

        <div className="mb-8">
          <input type="text" placeholder="search products or topics" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500" />
        </div>

        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{category.name}</h2>
              <div className="space-y-px">
                {category.contacts.map((contact) => (
                  <div key={contact.product} className="flex items-start justify-between border-t border-zinc-200 py-4 first:border-t-0 dark:border-zinc-800">
                    <div className="flex-1">
                      <button onClick={() => copyHandlesToClipboard(contact.product, contact.handles)} className="cursor-pointer text-left text-sm font-medium text-zinc-900 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-100" title="Click to copy all handles">
                        {copiedProduct === contact.product ? <span className="text-green-600">Copied!</span> : contact.product}
                      </button>
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-orange-600 md:text-sm dark:text-zinc-400">
                          <Mail className="h-3 w-3" />
                          <span>{contact.email}</span>
                        </a>
                      )}
                    </div>
                    <div className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                      {contact.handles.length <= 2 ? (
                        contact.handles.map((handle) => (
                          <a key={handle} href={`https://x.com/${handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-400">
                            <Avatar className="h-5 w-5 flex-shrink-0">
                              <AvatarImage src={`https://unavatar.io/x/${handle.replace('@', '')}`} alt={handle} />
                              <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{handle.slice(1, 3).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="leading-none">{handle}</span>
                          </a>
                        ))
                      ) : (
                        <>
                          {contact.handles.slice(0, 2).map((handle) => (
                            <a key={handle} href={`https://x.com/${handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-400">
                              <Avatar className="h-5 w-5 flex-shrink-0">
                                <AvatarImage src={`https://unavatar.io/x/${handle.replace('@', '')}`} alt={handle} />
                                <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{handle.slice(1, 3).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="leading-none">{handle}</span>
                            </a>
                          ))}
                          <Popover>
                            <PopoverTrigger className="text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base dark:text-zinc-400">more</PopoverTrigger>
                            <PopoverContent className="w-auto border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                              <div className="flex flex-col gap-2">
                                {contact.handles.slice(2).map((handle) => (
                                  <a key={handle} href={`https://x.com/${handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400">
                                    <Avatar className="h-5 w-5 flex-shrink-0">
                                      <AvatarImage src={`https://unavatar.io/twitter/${handle.replace('@', '')}`} alt={handle} />
                                      <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{handle.slice(1, 3).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="leading-none">{handle}</span>
                                  </a>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-zinc-500 dark:text-zinc-400">
          Have more contacts to add?{' '}
          <a href="https://github.com/kulterryan/who-to-bother-at-on-x" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400">
            Submit a pull request
          </a>{' '}
          on GitHub or mention{' '}
          <a href="https://x.com/thehungrybird_" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400">
            @thehungrybird_
          </a>{' '}
          on X.
        </p>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Concept by:{' '}
          <a href="https://x.com/strehldev" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400">
            @strehldev
          </a>
        </p>
        <div className="mt-6 flex justify-center">
          <ModeToggle />
        </div>
      </main>
    </div>
  );
}
