import { createAEOWorker } from "@dualmark/cloudflare";
import upstream from "@tanstack/react-start/server-entry";

const tanstackWorker = {
  fetch: (request: Request) => upstream.fetch(request),
};

const skipExtensions = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
  ".ico",
  ".woff",
  ".woff2",
  ".xml",
  ".json",
  ".txt",
  ".pdf",
  ".md",
] as const;

export default createAEOWorker({
  upstream: tanstackWorker,
  trailingSlash: "never",
  enableLinkHeader: false,
  skip: {
    extensions: skipExtensions,
  },
});
