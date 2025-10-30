"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy } from "lucide-react"

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null)

  const categories = [
    {
      name: "Frameworks & OSS",
      contacts: [
        { product: "Next.js", handles: ["@timneutkens"] },
        { product: "Nuxt.js", handles: ["@Atinux"] },
        { product: "Turbopack", handles: ["@timneutkens"] },
        { product: "Turborepo", handles: ["@anthonysheww"] },
        { product: "shadcn/ui", handles: ["@shadcn"] },
        { product: "Workflows", handles: ["@TooTallNate"] },
        { product: "AI Elements / Streamdown / next-forge", handles: ["@haydenbleasel"] },
        { product: "tweakcn", handles: ["@iamsahaj_xyz"] },
      ],
    },
    {
      name: "Public Vercel Sites & Community",
      contacts: [
        {
          product: "Community",
          handles: ["@GabbyShires", "@paulienuh", "@AmyAEgan", "@jacobmparis", "@sun_anshuman", "@kapehe_ok"],
        },
        { product: "Blog / Changelog / Marketing pages / Event pages", handles: ["@ZeeJab"] },
        { product: "Vercel Sites", handles: ["@plmrry"] },
      ],
    },
    {
      name: "Vercel products",
      contacts: [
        { product: "Domains", handles: ["@RhysSullivan", "@ethanniser"] },
        { product: "Functions / Runtime / Compute", handles: ["@tomlienard", "@dglsparsons", "@gudmundur"] },
        { product: "Builds", handles: ["@SheardLuke", "@gudmundur"] },
        { product: "Observability / Speed Insights / Web Analytics", handles: ["@linstobias", "@malavikabala"] },
        { product: "Auth", handles: ["@okbel"] },
        { product: "Toolbar", handles: ["@gkaragkiaouris"] },
        { product: "Dashboard", handles: ["@witsdev", "@z0oks", "@JohnPhamous"] },
        { product: "Marketplace / Integrations", handles: ["@th_mdo"] },
        { product: "Enterprise", handles: ["@sceiler"] },
        { product: "Image Optimization", handles: ["@styfle"] },
        { product: "BotID", handles: ["@andrewqu"] },
        { product: "Vercel Agent", handles: ["@JohnPhamous"] },
        { product: "Sandbox", handles: ["@gudmundur"] },
      ],
    },
    {
      name: "v0 & AI",
      contacts: [
        {
          product: "v0",
          handles: [
            "@max_leiter",
            "@EstebanSuarez",
            "@rickeyswuave",
            "@sonofalli",
            "@FernandoTheRojo",
            "@montonenicoto",
          ],
        },
        { product: "v0 Enterprise", handles: ["@TheWuster935"] },
        { product: "v0 Design Systems", handles: ["@TheWuster935"] },
        { product: "AI SDK", handles: ["@nishimiya"] },
        { product: "AI Gateway", handles: ["@rtaneja_"] },
        { product: "MCP", handles: ["@allenzhou101", "@andrewqu"] },
        { product: "Next.js Evals", handles: ["@MattLenhard"] },
      ],
    },
    {
      name: "Other",
      contacts: [
        { product: "Mobile", handles: ["@FernandoTheRojo"] },
        { product: "Architecture / Implementation questions", handles: ["@philzona"] },
        { product: "Vercel Professional Services", handles: ["@dom_sipowicz", "@goncy"] },
        { product: "Terraform Support", handles: ["@dglsparsons"] },
      ],
    },
  ]

  const filteredCategories = categories
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

  const copyHandlesToClipboard = async (product: string, handles: string[]) => {
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
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="mb-12 flex items-center gap-2 text-2xl font-medium text-balance md:text-3xl">
          who to bother at ▲ on X
        </h1>

        <p className="mb-8 text-sm text-zinc-500">
          This is a community-maintained list and not officially affiliated with Vercel. For official support, use the{" "}
          <a
            href="https://community.vercel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white hover:decoration-zinc-500"
          >
            Vercel Community
          </a>
          .
        </p>

        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
          <Copy className="h-4 w-4" />
          <span>Click any topic to copy all contacts</span>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="search products or topics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-600">{category.name}</h2>
              <div className="space-y-px">
                {category.contacts.map((contact) => (
                  <div
                    key={contact.product}
                    className="flex items-center justify-between border-t border-zinc-800 py-4 first:border-t-0"
                  >
                    <button
                      onClick={() => copyHandlesToClipboard(contact.product, contact.handles)}
                      className="cursor-pointer text-left text-sm font-medium text-zinc-100 transition-colors hover:text-white md:text-base"
                      title="Click to copy all handles"
                    >
                      {copiedProduct === contact.product ? (
                        <span className="text-green-500">Copied!</span>
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
                            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white md:text-base"
                          >
                            <Avatar className="h-5 w-5 flex-shrink-0">
                              <AvatarImage
                                src={`https://unavatar.io/twitter/${handle.replace("@", "")}`}
                                alt={handle}
                              />
                              <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-400">
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
                              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white md:text-base"
                            >
                              <Avatar className="h-5 w-5 flex-shrink-0">
                                <AvatarImage
                                  src={`https://unavatar.io/twitter/${handle.replace("@", "")}`}
                                  alt={handle}
                                />
                                <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-400">
                                  {handle.slice(1, 3).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="leading-none">{handle}</span>
                            </a>
                          ))}
                          <Popover>
                            <PopoverTrigger className="text-sm text-zinc-400 transition-colors hover:text-white md:text-base">
                              more ▲
                            </PopoverTrigger>
                            <PopoverContent className="w-auto border-zinc-800 bg-zinc-950 p-3">
                              <div className="flex flex-col gap-2">
                                {contact.handles.slice(2).map((handle) => (
                                  <a
                                    key={handle}
                                    href={`https://x.com/${handle.replace("@", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
                                  >
                                    <Avatar className="h-5 w-5 flex-shrink-0">
                                      <AvatarImage
                                        src={`https://unavatar.io/twitter/${handle.replace("@", "")}`}
                                        alt={handle}
                                      />
                                      <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-400">
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
            href="https://x.com/strehldev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white hover:decoration-zinc-500"
          >
            @strehldev
          </a>{" "}
          on X.
        </p>
      </main>
    </div>
  )
}
