"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

interface Contact {
  product: string
  handles: string[]
}

interface Category {
  name: string
  contacts: Contact[]
}

export const Route = createFileRoute('/')({ 
     component: Page,
 }) 
  

function Page() {
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null)

  const categories: Category[] = [
    {
      name: "Leadership",
      contacts: [
        { product: "CTO", handles: ["@dok2001"] },
      ],
    },
    {
      name: "Developers & AI",
      contacts: [
        { product: "VP Developers & AI", handles: ["@ritakozlov_"] },
        { product: "AI Agents", handles: ["@threepointone"] },
      ],
    },
    {
      name: "Infrastructure",
      contacts: [
        { product: "Storage & Databases", handles: ["@elithrar"] },
        { product: "Workers", handles: ["@KentonVarda"] },
      ],
    },
  ]

  const filteredCategories: Category[] = categories
    .map((category) => ({
      ...category,
      contacts: category.contacts.filter((contact) => {
        const query = searchQuery.toLowerCase()
        const productMatch = contact.product.toLowerCase().includes(query)
        const handleMatch = contact.handles.some((handle) => handle.toLowerCase().includes(query))
        return productMatch || handleMatch
      }),
    }))
    .filter((category) => category.contacts.length > 0)

  const copyHandlesToClipboard = async (product: string, handles: string[]): Promise<void> => {
    const handlesString = handles.join(" ")
    try {
      await navigator.clipboard.writeText(handlesString)
      setCopiedProduct(product)
      setTimeout(() => setCopiedProduct(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="mb-12 flex items-center gap-2 text-2xl font-medium text-balance text-zinc-900 md:text-3xl">
          who to bother at <svg xmlns="http://www.w3.org/2000/svg" width="66" height="30" viewBox="0 0 66 30" fill="none" className="shrink-0 transition-colors duration-200 ease-out text-accent-100" id="nav-logo-icon"><path fill="currentColor" className="transition-colors duration-400 ease-out" d="M52.688 13.028c-.22 0-.437.008-.654.015a.3.3 0 0 0-.102.024.37.37 0 0 0-.236.255l-.93 3.249c-.401 1.397-.252 2.687.422 3.634.618.876 1.646 1.39 2.894 1.45l5.045.306a.45.45 0 0 1 .435.41.5.5 0 0 1-.025.223.64.64 0 0 1-.547.426l-5.242.306c-2.848.132-5.912 2.456-6.987 5.29l-.378 1a.28.28 0 0 0 .248.382h18.054a.48.48 0 0 0 .464-.35c.32-1.153.482-2.344.48-3.54 0-7.22-5.79-13.072-12.933-13.072M44.807 29.578l.334-1.175c.402-1.397.253-2.687-.42-3.634-.62-.876-1.647-1.39-2.896-1.45l-23.665-.306a.47.47 0 0 1-.374-.199.5.5 0 0 1-.052-.434.64.64 0 0 1 .552-.426l23.886-.306c2.836-.131 5.9-2.456 6.975-5.29l1.362-3.6a.9.9 0 0 0 .04-.477C48.997 5.259 42.789 0 35.367 0c-6.842 0-12.647 4.462-14.73 10.665a6.92 6.92 0 0 0-4.911-1.374c-3.28.33-5.92 3.002-6.246 6.318a7.2 7.2 0 0 0 .18 2.472C4.3 18.241 0 22.679 0 28.133q0 .74.106 1.453a.46.46 0 0 0 .457.402h43.704a.57.57 0 0 0 .54-.418"></path></svg> on X
        </h1>

        <p className="mb-8 text-sm text-zinc-600">
          This is a community-maintained list and not officially affiliated with Cloudflare. For official support, use the{" "}
          <a
            href="https://community.cloudflare.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
          >
            Cloudflare Community
          </a>
          .
        </p>

        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Copy className="h-4 w-4" />
          <span>Click any topic to copy all contacts</span>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="search products or topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">{category.name}</h2>
              <div className="space-y-px">
                {category.contacts.map((contact) => (
                  <div
                    key={contact.product}
                    className="flex items-center justify-between border-t border-zinc-200 py-4 first:border-t-0"
                  >
                    <button
                      onClick={() => copyHandlesToClipboard(contact.product, contact.handles)}
                      className="cursor-pointer text-left text-sm font-medium text-zinc-900 transition-colors hover:text-orange-600 md:text-base"
                      title="Click to copy all handles"
                    >
                      {copiedProduct === contact.product ? (
                        <span className="text-green-600">Copied!</span>
                      ) : (
                        contact.product
                      )}
                    </button>
                    <div className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                      {contact.handles.length <= 2 ? (
                        contact.handles.map((handle) => (
                          <a
                            key={handle}
                            href={`https://x.com/${handle.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base"
                          >
                            <Avatar className="h-5 w-5 flex-shrink-0">
                              <AvatarImage
                                src={`https://unavatar.io/twitter/${handle.replace("@", "")}`}
                                alt={handle}
                              />
                              <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600">
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
                              key={handle}
                              href={`https://x.com/${handle.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base"
                            >
                              <Avatar className="h-5 w-5 flex-shrink-0">
                                <AvatarImage
                                  src={`https://unavatar.io/twitter/${handle.replace("@", "")}`}
                                  alt={handle}
                                />
                                <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600">
                                  {handle.slice(1, 3).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="leading-none">{handle}</span>
                            </a>
                          ))}
                          <Popover>
                            <PopoverTrigger className="text-sm text-zinc-600 transition-colors hover:text-orange-600 md:text-base">
                              more ▲
                            </PopoverTrigger>
                            <PopoverContent className="w-auto border-zinc-200 bg-white p-3 shadow-lg">
                              <div className="flex flex-col gap-2">
                                {contact.handles.slice(2).map((handle) => (
                                  <a
                                    key={handle}
                                    href={`https://x.com/${handle.replace("@", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-orange-600"
                                  >
                                    <Avatar className="h-5 w-5 flex-shrink-0">
                                      <AvatarImage
                                        src={`https://unavatar.io/twitter/${handle.replace("@", "")}`}
                                        alt={handle}
                                      />
                                      <AvatarFallback className="bg-zinc-100 text-[10px] text-zinc-600">
                                        {handle.slice(1, 3).toUpperCase()}
                                      </AvatarFallback>
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

        <p className="mt-12 text-sm text-zinc-500">
          Have more contacts to add? Mention{" "}
          <a
            href="https://x.com/thehungrybird_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
          >
            @thehungrybird_
          </a>{" "}
          on X.
        </p>
        <p className="mt-6 text-sm text-zinc-500">Concept by: <a
            href="https://x.com/strehldev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-700 hover:decoration-orange-400"
          >@strehldev</a></p>
      </main>
    </div>
  )
}
